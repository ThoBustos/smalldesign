import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ActionArrow, RollingLabel } from "./HeroConcept";
import "./landing-ending.css";
import "./wordmark-studies.css";

export function EmailLink({ compact = false }: { compact?: boolean }) {
  return (
    <a className="contact-email" href="mailto:human@small.design">
      <RollingLabel>{compact ? "Email Small" : "human@small.design"}</RollingLabel>
      <ActionArrow direction="↗" />
    </a>
  );
}

export function ContactFooter() {
  const footer = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const el = footer.current!;
      const targets = el.querySelectorAll(".contact-copy h2, .contact-copy p, .contact-copy a");
      const reveal = gsap.from(targets, {
        opacity: 0,
        y: 8,
        duration: 0.55,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "opacity,transform",
        paused: true,
      });
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { reveal.play(); observer.disconnect(); }
      }, { threshold: 0.2 });
      observer.observe(el);
      const focus = () => { reveal.progress(1); };
      el.addEventListener("focusin", focus);
      return () => { observer.disconnect(); el.removeEventListener("focusin", focus); };
    }, footer);
    return () => media.revert();
  }, []);
  return (
    <section ref={footer} className="contact-footer contact-footer-proof" id="next" aria-labelledby="contact-title">
      <div className="contact-copy">
        <h2 id="contact-title" lang="en" translate="no">
          <span>Something</span>{" "}
          <span>on your</span>{" "}
          <span>mind?</span>
        </h2>
        <div className="contact-details">
          <p>Tell us what you’re working on.</p>
          <EmailLink />
        </div>
      </div>
    </section>
  );
}

export function WordmarkScene() {
  const film = useRef<HTMLVideoElement>(null);
  const wrapper = useRef<HTMLElement>(null);
  const playButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const video = film.current!;
    const panel = wrapper.current!;
    const button = playButton.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let attempt = 0;
    let timeout = 0;

    function setPlayback(state: "waiting" | "loading" | "playing" | "blocked" | "finished") {
      panel.dataset.playback = state;
      window.clearTimeout(timeout);
    }

    function stop(state: "waiting" | "blocked" | "finished") {
      attempt += 1;
      video.pause();
      setPlayback(state);
    }

    function play(manual = false) {
      const state = panel.dataset.playback;
      if (reduce.matches || document.hidden || state === "loading" || state === "finished") return;
      if (!manual && (state === "blocked" || (!visible && state !== "playing"))) return;

      const current = ++attempt;
      const blocked = () => {
        if (attempt === current) stop("blocked");
      };
      setPlayback("loading");
      if (manual && video.error) video.load();
      video.muted = true;
      video.play().then(() => {
        if (attempt === current) setPlayback("playing");
      }, blocked);
      timeout = window.setTimeout(blocked, 4000);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .35;
      if (panel.dataset.playback === "waiting") play();
    }, { threshold: [.35] });

    const playManually = () => play(true);
    const finish = () => stop("finished");
    const onError = () => {
      if (panel.dataset.playback !== "finished") stop("blocked");
    };
    const onReduce = () => {
      if (reduce.matches) finish();
      else {
        setPlayback("waiting");
        play();
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (panel.dataset.playback === "loading") stop("waiting");
        else video.pause();
      } else if (panel.dataset.playback === "waiting" || panel.dataset.playback === "playing") play();
    };

    setPlayback(reduce.matches ? "finished" : video.error ? "blocked" : "waiting");
    observer.observe(panel);
    button.addEventListener("click", playManually);
    video.addEventListener("ended", finish);
    video.addEventListener("error", onError);
    reduce.addEventListener("change", onReduce);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop("waiting");
      observer.disconnect();
      button.removeEventListener("click", playManually);
      video.removeEventListener("ended", finish);
      video.removeEventListener("error", onError);
      reduce.removeEventListener("change", onReduce);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return (
    <section className="wordmark-scene wordmark-scene-reverse-type" id="work" data-caption="journey" aria-labelledby="wordmark-scene-title">
      <div className="wordmark-scene-caption" lang="en" translate="no">
        <h2 id="wordmark-scene-title">From pitch to product.</h2>
        <p>From product to market.</p>
      </div>
      <figure ref={wrapper} className="footer-motion">
        <div className="footer-motion-media">
          <video
            ref={film}
            muted
            playsInline
            preload="auto"
            src="/assets/footer-complete-m-v22.mp4"
            aria-hidden="true"
          />
          <div className="footer-motion-poster">
            <img src="/assets/footer-complete-m-v22.webp" width="800" height="587" alt="Small" translate="no" />
          </div>
        </div>
      </figure>
      <button className="wordmark-play" type="button" ref={playButton}>Play animation</button>
    </section>
  );
}
