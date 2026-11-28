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
        <h2 id="contact-title">
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
  const poster = useRef<HTMLImageElement>(null);
  const wrapper = useRef<HTMLElement>(null);
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
      else if (started || (visible && v.readyState >= 2)) play();
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
    <section className="wordmark-scene wordmark-scene-reverse-type" id="work" data-caption="journey" aria-labelledby="wordmark-scene-title">
      <div className="wordmark-scene-caption">
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
            style={{ visibility: "hidden" }}
            aria-hidden="true"
          >
            <source src="/assets/footer-complete-m-v22.mp4" type="video/mp4" />
          </video>
          <img
            ref={poster}
            src="/assets/footer-complete-m-v22.webp"
            width="800"
            height="587"
            alt="Small"
            hidden
          />
        </div>
      </figure>
    </section>
  );
}
