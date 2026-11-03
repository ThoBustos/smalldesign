import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GrainOverlay } from "@/components/shared/grain-overlay";
import { useHeroCards } from "../hooks/use-hero-cards";
import { content, heroZones } from "../landing-content";

type QuickSetter = (value: number) => void;

export function Hero() {
  const [activeZone, setActiveZone] = useState(0);
  const followerRef = useRef<HTMLDivElement>(null);
  const cardTrackRef = useRef<HTMLDivElement>(null);
  const quickSettersRef = useRef<{ x: QuickSetter; y: QuickSetter } | null>(null);
  const lastTargetRef = useRef({ x: 0, y: 0 });

  useHeroCards({ cardTrackRef, setActiveZone });

  useEffect(() => {
    const follower = followerRef.current;
    if (!follower) return;

    gsap.set(follower, {
      x: window.innerWidth * 0.68,
      xPercent: -50,
      y: window.innerHeight * 0.48,
      yPercent: -50,
    });

    quickSettersRef.current = {
      x: gsap.quickTo(follower, "x", { duration: 0.48, ease: "power3.out" }),
      y: gsap.quickTo(follower, "y", { duration: 0.48, ease: "power3.out" }),
    };

    return () => {
      gsap.killTweensOf(follower);
      quickSettersRef.current = null;
    };
  }, []);

  const moveFollower = (event: ReactPointerEvent<HTMLElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const nextZone = Math.min(heroZones.length - 1, Math.max(0, Math.floor((x / rect.width) * heroZones.length)));
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const cardRect = followerRef.current?.getBoundingClientRect();
    const halfCardWidth = (cardRect?.width ?? 320) / 2;
    const halfCardHeight = (cardRect?.height ?? 280) / 2;
    const cardX = clamp(x + halfCardWidth + 24, halfCardWidth + 18, rect.width - halfCardWidth - 18);
    const cardY = clamp(y + halfCardHeight + 18, halfCardHeight + 18, rect.height - halfCardHeight - 18);
    const deltaX = cardX - lastTargetRef.current.x;
    const deltaY = cardY - lastTargetRef.current.y;
    const rotation = clamp(deltaX * 0.025, -5, 5);
    const lift = clamp(Math.abs(deltaY) * 0.01, 0, 4);

    setActiveZone(nextZone);
    quickSettersRef.current?.x(cardX);
    quickSettersRef.current?.y(cardY);
    lastTargetRef.current = { x: cardX, y: cardY };

    if (cardTrackRef.current) {
      gsap.to(cardTrackRef.current, {
        rotate: rotation,
        y: -lift,
        duration: 0.34,
        ease: "power3.out",
        overwrite: true,
      });
      gsap.to(cardTrackRef.current, {
        rotate: 0,
        y: 0,
        duration: 0.7,
        delay: 0.08,
        ease: "elastic.out(1, 0.72)",
        overwrite: "auto",
      });
    }
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
