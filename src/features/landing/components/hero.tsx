import { type PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { GrainOverlay } from "@/components/shared/grain-overlay";
import { useHeroCards } from "../hooks/use-hero-cards";
import { content, heroZones } from "../landing-content";

export function Hero() {
  const [activeZone, setActiveZone] = useState(0);
  const followerRef = useRef<HTMLDivElement>(null);
  const cardTrackRef = useRef<HTMLDivElement>(null);

  useHeroCards({ cardTrackRef, setActiveZone });

  const moveFollower = (event: ReactPointerEvent<HTMLElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const nextZone = Math.min(heroZones.length - 1, Math.max(0, Math.floor((x / rect.width) * heroZones.length)));
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const cardSafeX = clamp(rect.width * 0.22, 260, 360);
    const cardSafeY = clamp(rect.height * 0.18, 150, 230);
    const zoneOffset = nextZone === 0 ? rect.width * 0.24 : nextZone === heroZones.length - 1 ? rect.width * -0.18 : 0;
    const zoneMinX = nextZone === 0 ? rect.width * 0.58 : cardSafeX;
    const cardX = clamp(x + zoneOffset, zoneMinX, rect.width - cardSafeX);
    const cardY = clamp(y, cardSafeY, rect.height - cardSafeY);

    setActiveZone(nextZone);
    followerRef.current?.style.setProperty("--cursor-x", `${cardX}px`);
    followerRef.current?.style.setProperty("--cursor-y", `${cardY}px`);
  };

  return (
    <section className="studio-hero hero-depth hero-follower" onPointerMove={moveFollower}>
      <GrainOverlay />
      <div className="hero-meta js-hero-reveal">
        <span>{content.studio}</span>
      </div>
      <h1>
        {heroZones.map((zone, index) => (
          <span className={`js-hero-reveal${activeZone === index ? " is-active" : ""}`} key={zone.key}>
            {zone.label}
          </span>
        ))}
      </h1>
      <p className="hero-note js-hero-reveal">{content.headline}</p>
      <div className="hero-cursor-artifact" ref={followerRef} aria-hidden="true">
        <div className="hero-card-track" ref={cardTrackRef}>
          {heroZones.map((zone, index) => (
            <div className={`hero-cursor-card js-hero-reveal${activeZone === index ? " is-active" : ""}`} key={zone.key}>
              <img src={zone.image} alt="" width="1456" height="816" decoding="async" />
              <span>{zone.line}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-transition-curtain" aria-hidden="true" />
    </section>
  );
}
