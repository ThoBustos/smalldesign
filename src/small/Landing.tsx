import { captureDiagnosticEvent } from "./analytics";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { startHero } from "./hero-motion";
export function Wordmark() {
  return (
    <a href="/" className="brand" aria-label="Small home">
      <span>small</span>
      <i aria-hidden="true" />
    </a>
  );
}
export function Landing() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    let stopHero: (() => void) | undefined;
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = hero.current!.querySelectorAll("h1 span, .bottom-copy p, .diagnostic");
      gsap.set(targets, { opacity: 0, y: 10 });
      const entrance = gsap.timeline({ paused: true })
        .to(targets[0], { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 0)
        .to(targets[1], { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 0.16)
        .to(targets[2], { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 1.35)
        .to(targets[3], { opacity: 1, y: 0, duration: 1, ease: "power2.out", clearProps: "opacity,transform" }, 2.55);
      let started = false;
      const reveal = () => { if (!started) { started = true; entrance.play(); } };
      stopHero = startHero(canvas.current!, reveal, reveal);
      return () => { stopHero?.(); };
    }, hero);
    media.add("(prefers-reduced-motion: reduce)", () => startHero(canvas.current!));
    return () => { media.revert(); stopHero?.(); };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header>
        <Wordmark />
      </header>
      <main ref={hero} id="main" className="hero">
        <h1>
          <span>Built to be understood.</span>
          <span>Designed to be chosen.</span>
        </h1>
        <div className="scene">
          <canvas
            ref={canvas}
            role="img"
            aria-label="Small’s painted companion rolls in, unfolds and walks"
          />
        </div>
        <div className="bottom-copy">
          <p>
            We’re Small, an independent design studio. From your positioning to
            the product people use, we help every part of your company tell the
            same story and work toward the same goal.
          </p>
          <a className="text-action diagnostic" href="/diagnostic" onClick={() => captureDiagnosticEvent("small_diagnostic_clicked")}>
            <span className="action-label">Request your Small Diagnostic</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </main>
      <ContactFooter />
    </>
  );
}
function ContactFooter() {
  const footer = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const el = footer.current!;
      const targets = el.querySelectorAll(".contact-copy h2, .contact-copy p, .contact-copy a");
      gsap.set(targets, { opacity: 0, y: 12 });
      const reveal = gsap.timeline({ paused: true })
        .to(targets[0], { opacity: 1, y: 0, duration: 1.15, ease: "power2.out" }, 0.15)
        .to(targets[1], { opacity: 1, y: 0, duration: 1.05, ease: "power2.out" }, 1.15)
        .to(targets[2], { opacity: 1, y: 0, duration: 1, ease: "power2.out", clearProps: "opacity,transform" }, 2.15);
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
  const film = useRef<HTMLVideoElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const v = film.current!,
      img = poster.current!,
      el = wrapper.current!,
      reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let finished = false, started = false, visible = false, disposed = false;
    const showPoster = () => {
      v.style.visibility = "hidden";
      img.hidden = false;
      el.dataset.playback = "finished";
    };
    const play = () => {
      if (disposed || finished || reduce.matches || document.hidden) return;
      started = true;
      el.dataset.playback = "playing";
      // Reveal only once decoded data is available; never flash the final wordmark.
      v.play().then(() => {
        if (!disposed && !finished) { v.style.visibility = "visible"; img.hidden = true; }
      }).catch(() => { if (!disposed) { finished = true; showPoster(); } });
    };
    const onReduce = () => {
      if (reduce.matches) { finished = true; v.pause(); showPoster(); }
    };
    const end = () => { finished = true; showPoster(); };
    const visibility = () => {
      if (document.hidden) v.pause();
      else if (started && !finished) play();
    };
    const ready = () => { if (visible && !started) play(); };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.35;
      if (visible && !started && v.readyState >= 2) play();
      // Once started, scrolling does not pause or restart the sign-off.
    }, { threshold: [0, 0.35] });
    el.dataset.playback = "waiting";
    observer.observe(el);
    v.addEventListener("loadeddata", ready);
    v.addEventListener("ended", end);
    reduce.addEventListener("change", onReduce);
    document.addEventListener("visibilitychange", visibility);
    if (reduce.matches) { finished = true; showPoster(); }
    return () => {
      disposed = true;
      observer.disconnect();
      v.pause();
      v.removeEventListener("loadeddata", ready);
      v.removeEventListener("ended", end);
      reduce.removeEventListener("change", onReduce);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <footer
      ref={footer}
      className="contact-footer"
      id="next"
      aria-labelledby="contact-title"
    >
      <div className="contact-copy">
        <h2 id="contact-title">
          Something
          <br />
          on your
          <br />
          mind?
        </h2>
        <p>
          Tell us what you’re thinking.
          <br />
          We’ll take a closer look.
        </p>
        <a className="text-action" href="mailto:human@small.design">
          <span className="action-label">human@small.design</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div ref={wrapper} className="footer-motion">
        <video
          ref={film}
          muted
          playsInline
          preload="auto"
          style={{ visibility: "hidden" }}
          aria-hidden="true"
        >
          <source src="/assets/footer-complete-m-v22.mp4" type="video/mp4" />
        </video>
        <img
          ref={poster}
          src="/assets/footer-complete-m-v22.webp"
          alt="Small"
          hidden
        />
      </div>
    </footer>
  );
}
