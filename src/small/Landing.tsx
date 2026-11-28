import { useEffect, useLayoutEffect, useRef } from "react";
import { HeroConcept, RollingLabel } from "./HeroConcept";
import { HeroPointer } from "./HeroPointer";
import { ContactFooter, EmailLink, WordmarkScene } from "./LandingEnding";
import { startHero } from "./hero-motion";
import "./landing-sections.css";
import "./landing-hero.css";

export function Wordmark() {
  return (
    <a href="/" className="brand" aria-label="Small home">
      <span>small</span>
      <i aria-hidden="true" />
    </a>
  );
}
const studioCopy = "We’re Small, an independent design studio. From your positioning to the product people use, we help every part of your company tell the same story and work toward the same goal.";

export function Landing() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => startHero(canvas.current!), []);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    const frame = window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const scene = (
    <div className="scene">
      <canvas ref={canvas} role="img" aria-label="Small’s painted companion rolls in, unfolds and walks" />
    </div>
  );
  return (
    <>
      <HeroPointer />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="landing-header landing-header-quiet">
        <Wordmark />
        <nav aria-label="Main navigation">
          <a href="#work"><RollingLabel>Work</RollingLabel></a>
          <a href="#studio"><RollingLabel>Studio</RollingLabel></a>
          <a href="#next"><RollingLabel>Contact</RollingLabel></a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <HeroConcept scene={scene} studioCopy={studioCopy} />
        <WordmarkScene />
      </main>
      <footer>
        <ContactFooter />
        <div className="landing-signature signature-ink" id="signature">
          <a href="#main" className="signature-home" aria-label="Small, back to top">
            <span className="signature-wordmark" aria-hidden="true">small<i /></span>
          </a>
          <nav className="signature-links" aria-label="Footer">
            <a href="#work"><RollingLabel>Work</RollingLabel></a>
            <a href="#studio"><RollingLabel>Studio</RollingLabel></a>
            <EmailLink compact />
          </nav>
        </div>
      </footer>
    </>
  );
}
