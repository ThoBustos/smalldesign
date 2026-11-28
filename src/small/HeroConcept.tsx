import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import "./hero-concepts.css";
import "./hero-motion-concepts.css";

import { captureDiagnosticEvent } from "./analytics";

export function RollingLabel({ children }: { children: string }) {
  return (
    <span className="hero-roll-label">
      <span className="hero-roll-track">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

export function ActionArrow({ direction }: { direction: string }) {
  return (
    <span data-hero-arrow-dock aria-hidden="true">
      <span className="hero-action-arrow-glyph">{direction}</span>
    </span>
  );
}

export function HeroConcept({
  scene,
  studioCopy,
}: {
  scene: ReactNode;
  studioCopy: string;
}) {
  const title = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(title.current, { clipPath: "inset(0 0 100% 0)" }, {
        clipPath: "inset(0 0 0% 0)", duration: .92, ease: "power3.inOut",
        clearProps: "clipPath",
      });
    });
    return () => media.revert();
  }, []);

  return (
    <section className="hero hero-concept hero-concept-spine" aria-labelledby="landing-title">
      <div className="hero-concept-intro">
        <p>Small team, big work</p>
        <h1 ref={title} id="landing-title" lang="en" translate="no"><span>Design</span>{" "}<em>for</em>{" "}<span>ROI</span></h1>
      </div>
      {scene}
      <p id="studio" className="hero-concept-copy">{studioCopy}</p>
      <div className="hero-concept-actions">
        <a className="hero-concept-explore" href="#work">
          <RollingLabel>Scroll to explore</RollingLabel><ActionArrow direction="↓" />
        </a>
        <a className="hero-concept-diagnostic" href="/diagnostic" onClick={() => captureDiagnosticEvent("small_diagnostic_clicked")}>
          <RollingLabel>Request your Small Diagnostic</RollingLabel><ActionArrow direction="↗" />
        </a>
      </div>
    </section>
  );
}
