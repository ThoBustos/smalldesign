import { useEffect, useRef } from "react";
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
  useEffect(() => (canvas.current ? startHero(canvas.current) : undefined), []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header>
        <Wordmark />
      </header>
      <main id="main" className="hero">
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
          <a className="text-action diagnostic" href="/diagnostic">
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
  const film = useRef<HTMLVideoElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const v = film.current!,
      img = poster.current!,
      el = wrapper.current!,
      reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let finished = false,
      visible = false;
    const showPoster = () => {
      v.hidden = true;
      img.hidden = false;
    };
    const play = () => {
      if (!finished && !reduce.matches && !document.hidden) {
        v.hidden = false;
        img.hidden = true;
        v.play().catch(showPoster);
      }
    };
    const onReduce = () => {
      if (reduce.matches) {
        v.pause();
        showPoster();
      } else if (visible) play();
    };
    const end = () => {
      finished = true;
      showPoster();
    };
    const visibility = () => {
      if (document.hidden) v.pause();
      else if (visible) play();
    };
    const observer = new IntersectionObserver(
      (e) => {
        visible = e[0].isIntersecting;
        if (visible) play();
        else v.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    v.addEventListener("ended", end);
    reduce.addEventListener("change", onReduce);
    document.addEventListener("visibilitychange", visibility);
    if (reduce.matches) showPoster();
    return () => {
      observer.disconnect();
      v.pause();
      v.removeEventListener("ended", end);
      reduce.removeEventListener("change", onReduce);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return (
    <footer
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
          preload="none"
          poster="/assets/footer-complete-m-v22.webp"
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
