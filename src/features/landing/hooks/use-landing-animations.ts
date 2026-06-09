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
        const serviceCards = gsap.utils.toArray<HTMLElement>(".js-service-card");

        gsap.set(serviceCards, {
          clipPath: "inset(0 100% 0 0)",
          y: 34,
        });
        gsap.set(".service-image-mask", {
          clipPath: "inset(0 0 100% 0)",
        });
        gsap.set(".js-service-detail", {
          opacity: 0,
          y: 16,
        });

        const servicesTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".services-system",
            start: "top 74%",
          },
        });

        serviceCards.forEach((card, index) => {
          const imageMask = card.querySelector(".service-image-mask");
          const details = card.querySelectorAll(".js-service-detail");
          const at = index * 0.13;

          servicesTimeline
            .to(card, { clipPath: "inset(0 0% 0 0)", y: 0, duration: 0.72, ease: "power4.out" }, at)
            .to(imageMask, { clipPath: "inset(0 0 0% 0)", duration: 0.62, ease: "power3.inOut" }, at + 0.14)
            .to(details, { opacity: 1, y: 0, duration: 0.48, stagger: 0.06, ease: "power3.out" }, at + 0.3);
        });

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

        gsap.set(".hero-transition-curtain", { scaleY: 0, transformOrigin: "bottom" });
        gsap.set(".method-blackout", { scaleY: 1 });
        gsap.set(".method-editor", { opacity: 0, y: 16 });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".studio-hero",
              start: "bottom 96%",
              end: "bottom -10%",
              scrub: true,
            },
          })
          .set(".hero-depth h1 span", { color: "#050505", textShadow: "none" }, 0)
          .to(".hero-depth h1", { y: 118, scale: 1.08, transformOrigin: "left bottom", ease: "none" }, 0)
          .to(".hero-depth .hero-note", { y: 150, ease: "none" }, 0)
          .to(".hero-cursor-card:not(.is-active)", { opacity: 0, scale: 0.92, ease: "none" }, 0)
          .to(
            ".hero-cursor-artifact",
            {
              "--cursor-x": "50vw",
              "--cursor-y": "86vh",
              width: "clamp(360px, 32vw, 540px)",
              ease: "none",
            },
            0.08,
          )
          .to(".hero-cursor-card.is-active", { scale: 1.08, transformOrigin: "50% 50%", ease: "none" }, 0.08);

        gsap.to(".hero-cursor-card.is-active", {
          opacity: 0,
          y: -34,
          ease: "none",
          scrollTrigger: {
            trigger: ".studio-method",
            start: "top 20%",
            end: "top 8%",
            scrub: true,
          },
        });

        gsap.to(".method-editor", {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".studio-method",
            start: "top 72%",
            end: "top 36%",
            scrub: true,
          },
        });

        gsap.to(".method-kicker, .method-edit, .method-final", {
          color: "#f7f7f2",
          duration: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".studio-method",
            start: "top 76%",
            end: "top 42%",
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
              start: "top 76%",
              end: "top 42%",
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
            start: "top 54%",
            end: "center 48%",
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
        gsap.set(".js-service-card, .service-image-mask", { clearProps: "clipPath,transform" });
        gsap.set(".js-service-detail", { opacity: 1, y: 0 });
        gsap.set(".method-editor", { opacity: 1, y: 0 });
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
