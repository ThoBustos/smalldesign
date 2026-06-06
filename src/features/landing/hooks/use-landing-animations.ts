import { useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, Flip, Draggable);

export function useLandingAnimations(onLoaderDone: () => void) {
  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const motionMedia = gsap.matchMedia();

      if (reduceMotion) {
        onLoaderDone();
        gsap.set(".js-hero-reveal, .js-reveal, .studio-footer-word, .method-edit, .method-final", {
          clearProps: "transform",
          opacity: 1,
        });
        gsap.set(".method-kicker, .method-edit, .method-final", { color: "#f7f7f2" });
        gsap.set(".method-cut", { color: "rgba(247, 247, 242, 0.58)" });
        return;
      }

      const getLogoRect = () => document.querySelector<HTMLElement>(".studio-logo")?.getBoundingClientRect();
      const getLogoX = () => getLogoRect()?.left ?? 54;
      const getIntroScale = () => {
        const loaderMark = document.querySelector<HTMLElement>(".loader-mark");
        if (!loaderMark) return 4.5;
        const width = loaderMark.getBoundingClientRect().width || 1;
        return Math.min(Math.max((window.innerWidth * 0.34) / width, 3.2), 5.4);
      };
      const getIntroX = () => {
        const loaderMark = document.querySelector<HTMLElement>(".loader-mark");
        if (!loaderMark) return window.innerWidth / 2;

        const width = loaderMark.getBoundingClientRect().width || 1;
        const scale = getIntroScale();
        return window.innerWidth / 2 - (width * scale) / 2;
      };
      const syncLoaderTypography = () => {
        const logo = document.querySelector<HTMLElement>(".studio-logo");
        const loaderMark = document.querySelector<HTMLElement>(".loader-mark");
        if (!logo || !loaderMark) return;

        const styles = getComputedStyle(logo);
        gsap.set(loaderMark, {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          letterSpacing: styles.letterSpacing,
          lineHeight: styles.lineHeight,
        });
      };

      const createLoaderTimeline = () => {
        const loaderTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: onLoaderDone,
        });

        loaderTimeline
          .call(syncLoaderTypography)
          .set(".loader-mark", {
            x: getIntroX,
            y: () => window.innerHeight / 2,
            xPercent: 0,
            yPercent: -50,
            scale: getIntroScale,
          })
          .fromTo(
            ".loader-mark",
            { filter: "blur(14px)", opacity: 0 },
            { filter: "blur(0px)", opacity: 1, duration: 0.65 },
          )
          .to(
            ".loader-mark",
            {
              x: getLogoX,
              y: () => window.innerHeight / 2,
              xPercent: 0,
              yPercent: -50,
              duration: 1.25,
              ease: "power4.inOut",
            },
            "+=0.18",
          )
          .add(() => Flip.fit(".loader-mark", ".studio-logo", { duration: 0.95, ease: "power4.inOut", scale: true }), "+=0.2")
          .to({}, { duration: 0.95 })
          .to(".loader-progress", { opacity: 0, duration: 0.28, ease: "power2.out" }, "-=0.24")
          .to(".studio-loader", { opacity: 0, duration: 0.5, ease: "power2.out" }, "+=0.08");
      };

      motionMedia.add("(max-width: 640px), (pointer: coarse)", createLoaderTimeline);
      motionMedia.add("(min-width: 641px) and (pointer: fine)", createLoaderTimeline);

      gsap.fromTo(
        ".js-hero-reveal",
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" },
      );

      gsap.utils.toArray<HTMLElement>(".js-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
            },
          },
        );
      });

      motionMedia.add("(min-width: 901px)", () => {
        gsap.fromTo(
          ".studio-footer-word",
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".studio-footer",
              start: "top 76%",
            },
          },
        );

        gsap.fromTo(
          ".method-blackout",
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".studio-method",
              start: "top 92%",
              end: "top 18%",
              scrub: true,
            },
          },
        );

        gsap.to(".method-kicker, .method-edit, .method-final", {
          color: "#f7f7f2",
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".studio-method",
            start: "top 58%",
            end: "top 20%",
            scrub: true,
          },
        });

        gsap.fromTo(
          ".method-edit",
          { opacity: 0.22 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "none",
            scrollTrigger: {
              trigger: ".studio-method",
              start: "top 72%",
              end: "top 28%",
              scrub: true,
            },
          },
        );

        gsap.to(".method-cut", {
          color: "rgba(247, 247, 242, 0.22)",
          duration: 0.8,
          ease: "none",
          scrollTrigger: {
            trigger: ".studio-method",
            start: "top 44%",
            end: "center 44%",
            scrub: true,
          },
        });

        gsap.fromTo(
          ".method-final",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "none",
            scrollTrigger: {
              trigger: ".studio-method",
              start: "center 56%",
              end: "bottom 84%",
              scrub: true,
            },
          },
        );
      });

      motionMedia.add("(max-width: 900px)", () => {
        gsap.set(".method-kicker, .method-edit, .method-final", { color: "#f7f7f2" });
        gsap.set(".method-cut", { color: "rgba(247, 247, 242, 0.3)" });
        gsap.fromTo(
          ".method-final",
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".studio-method",
              start: "top 70%",
            },
          },
        );
        gsap.fromTo(
          ".studio-footer-word",
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.82,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".studio-footer",
              start: "top 78%",
            },
          },
        );
      });

      cleanupFns.push(() => motionMedia.revert());
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [onLoaderDone]);
}
