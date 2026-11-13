import { captureDiagnosticEvent } from "./analytics";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Wordmark } from "./Landing";
import { IdleCompanion } from "./IdleCompanion";
import { intakeConfig, Lead, sendLead, IntakeError } from "./intake";
import { loadSecurity } from "./security";
const groups = [
  [
    "stage",
    "Where are you starting?",
    ["Starting from scratch", "Improving something existing"],
  ],
  [
    "focus",
    "Where should we look?",
    ["Positioning", "Brand", "Website", "Product", "Help me decide"],
  ],
  [
    "goal",
    "What matters most right now?",
    [
      "A clearer story",
      "A stronger identity",
      "A better experience",
      "A new launch",
      "Not sure yet",
    ],
  ],
  [
    "role",
    "Your role",
    [
      "Founder / CEO",
      "Marketing / Growth",
      "Product / Engineering",
      "Design",
      "Other",
    ],
  ],
  ["size", "Team size", ["Just me", "2–10", "11–50", "51–200", "201+"]],
] as const;
const blank: Lead = {
  name: "",
  email: "",
  website: "",
  stage: "",
  focus: [],
  goal: "",
  role: "",
  size: "",
  note: "",
  company_fax: "",
  attribution: {},
};
export function Diagnostic() {
  const [lead, setLead] = useState<Lead>(() => {
    const attribution: Record<string, string> = {};
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      const v = new URLSearchParams(location.search).get(key);
      if (v) attribution[key] = v.slice(0, 200);
    }
    return { ...blank, attribution };
  });
  const [submittedId, setSubmittedId] = useState("");
  const [screen, setScreen] = useState<"form" | "review" | "success">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [token, setToken] = useState("");
  const [sending, setSending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const sendingRef = useRef(false);
  const challenge = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const identity = useRef({ signature: "", id: "" });
  useEffect(() => {
    if (screen !== "form") heading.current?.focus();
  }, [screen]);
  useEffect(() => {
    if (screen !== "review") return;
    let disposed = false,
      widget: string | undefined;
    if (!intakeConfig.endpoint || !intakeConfig.siteKey) return;
    loadSecurity()
      .then((api) => {
        if (disposed || !challenge.current) return;
        widget = api.render(challenge.current, {
          sitekey: intakeConfig.siteKey,
          action: "diagnostic",
          callback: (t) => {
            if (!disposed) {
              setToken(t);
              setStatus("Ready to send.");
            }
          },
          "expired-callback": () => {
            setToken("");
            setStatus("Security check expired. Please retry.");
          },
          "error-callback": () => {
            setToken("");
            setStatus(
              "Security check unavailable. Please retry or email human@small.design.",
            );
          },
        });
      })
      .catch(() => {
        if (!disposed)
          setStatus(
            "Security check unavailable. Please retry or email human@small.design.",
          );
      });
    return () => {
      disposed = true;
      if (widget !== undefined) window.turnstile?.remove(widget);
    };
  }, [screen, attempt]);
  function field(key: keyof Lead, value: string) {
    setLead((l) => ({ ...l, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }
  function review(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!lead.name.trim()) next.name = "Please add your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim()))
      next.email = "Please enter a valid email.";
    if (lead.website.trim()) {
      try {
        const url = new URL(
          /^https?:\/\//i.test(lead.website)
            ? lead.website
            : "https://" + lead.website,
        );
        if (
          !["http:", "https:"].includes(url.protocol) ||
          !url.hostname.includes(".") ||
          url.username ||
          url.password
        )
          throw Error();
      } catch {
        next.website = "Please enter a valid website.";
      }
    }
    for (const [key] of groups) {
      if (key === "size") continue;
      if (key === "focus" ? !lead.focus.length : !lead[key])
        next[key] = "Please choose an option.";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const signature = JSON.stringify(lead);
    if (signature !== identity.current.signature)
      identity.current = { signature, id: crypto.randomUUID() };
    setToken("");
    setStatus(
      intakeConfig.endpoint && intakeConfig.siteKey
        ? "Loading security check…"
        : "Online requests are unavailable. Please email human@small.design.",
    );
    setScreen("review");
  }
  async function send() {
    if (!token || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setStatus("Sending your request…");
    try {
      await sendLead(lead, identity.current.id, token);
      captureDiagnosticEvent("small_diagnostic_submitted");
      setSubmittedId(identity.current.id);
      setScreen("success");
    } catch (e) {
      if (e instanceof IntakeError && e.status === 409)
        identity.current = {
          signature: JSON.stringify(lead),
          id: crypto.randomUUID(),
        };
      setStatus(
        e instanceof Error && e.name === "TimeoutError"
          ? "We could not confirm receipt. Retry with the same details; your request will not be duplicated."
          : e instanceof Error
            ? e.message
            : "Please retry.",
      );
      setToken("");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }
  const textField = (
    key: "name" | "email" | "website",
    label: string,
    auto: string,
    type = "text",
  ) => (
    <div className="field" key={key}>
      <label htmlFor={key}>
        {label}
        {key === "website" && <span>Optional</span>}
      </label>
      <input
        id={key}
        name={key}
        type={type}
        autoComplete={auto}
        inputMode={key === "website" ? "url" : undefined}
        value={lead[key]}
        onChange={(e) => field(key, e.target.value)}
        maxLength={key === "name" ? 100 : key === "email" ? 254 : 500}
        required={key !== "website"}
        placeholder={
          key === "name"
            ? "Your full name"
            : key === "email"
              ? "you@company.com"
              : "yourcompany.com"
        }
        aria-invalid={Boolean(errors[key])}
        aria-describedby={key + "-error"}
      />
      <span className="error" id={key + "-error"}>
        {errors[key]}
      </span>
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#diagnostic-main">
        Skip to content
      </a>
      <header>
        <Wordmark />
      </header>
      <main id="diagnostic-main">
        <section className="intro">
          <h1>
            <span className="your">Your</span>
            <span className="diagnostic-word">diagnostic.</span>
          </h1>
          <p>
            A focused review of your brand, website and product, with clear
            priorities for what comes next.
          </p>
          <div className="companion">
            <IdleCompanion />
          </div>
        </section>
        <section className="request" aria-label="Diagnostic request">
          {screen === "form" ? (
            <form ref={form} onSubmit={review} noValidate>
              <h2>A little about you.</h2>
              <div className="intake-honeypot" aria-hidden="true">
                <label htmlFor="company-fax">Company fax</label>
                <input
                  id="company-fax"
                  name="company_fax"
                  tabIndex={-1}
                  autoComplete="off"
                  value={lead.company_fax}
                  onChange={(e) => field("company_fax", e.target.value)}
                />
              </div>
              <div className="pair">
                {textField("name", "Your name", "name")}
                {textField("email", "Work email", "email", "email")}
              </div>
              {groups.map(([key, label, options], index) => (
                <div key={key}>
                  {index === 1 && textField("website", "Website", "url")}
                  <fieldset className="choices">
                    <legend>{label}</legend>
                    <div className="choice-grid">
                      {options.map((option) => (
                        <label className="choice" key={option}>
                          <input
                            type={key === "focus" ? "checkbox" : "radio"}
                            name={key}
                            value={option}
                            checked={
                              key === "focus"
                                ? lead.focus.includes(option)
                                : lead[key] === option
                            }
                            onChange={(e) => {
                              if (key === "focus") {
                                setLead((l) => ({
                                  ...l,
                                  focus: e.target.checked
                                    ? [...l.focus, option]
                                    : l.focus.filter((x) => x !== option),
                                }));
                                setErrors((p) => ({ ...p, focus: "" }));
                              } else field(key, option);
                            }}
                            aria-invalid={Boolean(errors[key])}
                            aria-describedby={key + "-error"}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    <span className="error" id={key + "-error"}>
                      {errors[key]}
                    </span>
                  </fieldset>
                </div>
              ))}
              <div className="field note-field">
                <label htmlFor="note">
                  Add a note <span>Optional</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  maxLength={1500}
                  placeholder="Anything else we should know?"
                  rows={3}
                  value={lead.note}
                  onChange={(e) => field("note", e.target.value)}
                />
              </div>
              {Object.values(errors).some(Boolean) && (
                <p className="summary-error" role="status">
                  Please check the highlighted fields.
                </p>
              )}
              <div className="actions">
                <button type="submit" className="review-action">
                  <span className="label">Review my request</span>
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </div>
              <p className="preview-note">
                Review your details before sending. We use them to respond to
                your request.
              </p>
            </form>
          ) : screen === "review" ? (
            <section aria-labelledby="review-heading">
              <h2 ref={heading} id="review-heading" tabIndex={-1}>
                Your starting point.
              </h2>
              <dl>
                {[
                  ["Starting point", lead.stage],
                  ["Website", lead.website],
                  ["Focus", lead.focus.join(", ")],
                  ["Priority", lead.goal],
                  ["Name", lead.name],
                  ["Email", lead.email],
                  ["Role", lead.role],
                  ["Team size", lead.size],
                  ["Note", lead.note],
                ]
                  .filter(([, value]) => value)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
              </dl>
              <p className="not-sent">
                Check your details, then send your request to Small.
              </p>
              <div ref={challenge} id="security-check" />
              <p id="submit-status" role="status" aria-live="polite">
                {status}
              </p>
              <button
                type="button"
                className="send-email"
                disabled={!token || sending}
                onClick={send}
              >
                Send my request <span aria-hidden="true">↗</span>
              </button>
              {!token && !sending && (
                <button
                  type="button"
                  className="plain-action"
                  onClick={() => {
                    setToken("");
                    setStatus("Loading security check…");
                    setAttempt((n) => n + 1);
                  }}
                >
                  Retry security check
                </button>
              )}
              <p className="intake-contact">
                Prefer email?{" "}
                <a href="mailto:human@small.design">human@small.design</a>
              </p>
              <button
                type="button"
                className="plain-action"
                disabled={sending}
                onClick={() => setScreen("form")}
              >
                ← Edit my request
              </button>
            </section>
          ) : (
            <section data-submission-id={submittedId}>
              <h2 ref={heading} tabIndex={-1}>
                Your request is with us.
              </h2>
              <p>
                Thanks. We will review your starting point and reply by email.
              </p>
              <a href="/">Back to Small</a>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
