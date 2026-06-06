import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { heroZones } from "../landing-content";

gsap.registerPlugin(Draggable);

type UseHeroCardsOptions = {
  cardTrackRef: RefObject<HTMLDivElement>;
  setActiveZone: (index: number) => void;
};

export function useHeroCards({ cardTrackRef, setActiveZone }: UseHeroCardsOptions) {
  useEffect(() => {
    const track = cardTrackRef.current;
    if (!track) return;

    const media = gsap.matchMedia();

    media.add("(max-width: 900px), (pointer: coarse)", () => {
      const cards = Array.from(track.querySelectorAll<HTMLElement>(".hero-cursor-card"));
      let activeIndex = 0;

      const getRelativeIndex = (index: number) => {
        let relative = index - activeIndex;
        const half = heroZones.length / 2;

        if (relative > half) relative -= heroZones.length;
        if (relative < -half) relative += heroZones.length;

        return relative;
      };

      const setFan = (index = activeIndex) => {
        activeIndex = index;

        cards.forEach((card, cardIndex) => {
          const relative = getRelativeIndex(cardIndex);
          const isActive = relative === 0;

          gsap.to(card, {
            x: isActive ? 0 : relative < 0 ? -26 : 34,
            y: isActive ? 0 : relative < 0 ? 24 : 16,
            rotation: isActive ? 0 : relative < 0 ? -8 : 8,
            scale: isActive ? 1 : relative < 0 ? 0.82 : 0.86,
            opacity: isActive ? 1 : relative < 0 ? 0.48 : 0.72,
            zIndex: isActive ? 30 : relative < 0 ? 10 : 20,
            duration: 0.42,
            ease: "power3.out",
            overwrite: true,
          });
        });
      };

      gsap.set(track, { x: 0 });
      gsap.set(cards, { transformOrigin: "50% 86%" });
      setFan(0);

      const draggable = Draggable.create(track, {
        type: "x",
        bounds: { minX: -110, maxX: 110 },
        edgeResistance: 0.82,
        minimumMovement: 8,
        trigger: track,
        onPress: function () {
          this.applyBounds({ minX: -110, maxX: 110 });
        },
        onDrag: function () {
          gsap.to(cards[activeIndex], {
            rotation: this.x / 13,
            y: Math.abs(this.x) * -0.05,
            duration: 0.08,
            overwrite: true,
          });
        },
        onDragEnd: function () {
          const threshold = 44;
          let nextIndex = activeIndex;

          if (this.x < -threshold) nextIndex = (activeIndex + 1) % heroZones.length;
          if (this.x > threshold) nextIndex = (activeIndex - 1 + heroZones.length) % heroZones.length;

          setActiveZone(nextIndex);
          gsap.to(track, {
            x: 0,
            duration: 0.3,
            ease: "power3.out",
          });
          setFan(nextIndex);
        },
      })[0];

      return () => {
        draggable.kill();
        gsap.set(track, { clearProps: "transform" });
        gsap.set(cards, { clearProps: "transform,opacity,zIndex" });
      };
    });

    return () => media.revert();
  }, [cardTrackRef, setActiveZone]);
}
