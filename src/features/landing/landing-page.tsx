import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GrainOverlay } from "@/components/shared/grain-overlay";
import { landingContent } from "@/content/landing";

gsap.registerPlugin(ScrollTrigger, Flip);

const content = landingContent;
const heroZones = [
  {
    key: "belief",
    label: "Belief",
    line: content.serviceDetails[0].detail,
    image: content.serviceDetails[0].image,
  },
  {
    key: "made",
    label: "Made",
    line: content.serviceDetails[2].detail,
    image: content.images.hands,
  },
  {
    key: "visible",
    label: "Visible.",
    line: content.serviceDetails[3].detail,
    image: content.serviceDetails[3].image,
  },
];

export function LandingPage() {
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const motionMedia = gsap.matchMedia();

      if (reduceMotion) {
        setLoaderDone(true);
        gsap.set(".js-hero-reveal, .js-reveal, .studio-footer-word, .method-edit, .method-final", {
          clearProps: "transform",
          opacity: 1,
        });
        gsap.set(".method-kicker, .method-edit, .method-final", { color: "#f7f7f2" });
        gsap.set(".method-cut", { color: "rgba(247, 247, 242, 0.22)" });
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

      motionMedia.add("(max-width: 640px), (pointer: coarse)", () => {
        const loaderTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => setLoaderDone(true),
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
          .fromTo(".loader-mark", { filter: "blur(14px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: 0.65 })
          .to(".loader-mark", {
            x: getLogoX,
            y: () => window.innerHeight / 2,
            xPercent: 0,
            yPercent: -50,
            duration: 1.25,
            ease: "power4.inOut",
          }, "+=0.18")
          .add(() => Flip.fit(".loader-mark", ".studio-logo", { duration: 0.95, ease: "power4.inOut", scale: true }), "+=0.2")
          .to({}, { duration: 0.95 })
          .to(".loader-progress", { opacity: 0, duration: 0.28, ease: "power2.out" }, "-=0.24")
          .to(".studio-loader", { opacity: 0, duration: 0.5, ease: "power2.out" }, "+=0.08");
      });

      motionMedia.add("(min-width: 641px) and (pointer: fine)", () => {
        const loaderTimeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => setLoaderDone(true),
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
          .fromTo(".loader-mark", { filter: "blur(14px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: 0.65 })
          .to(".loader-mark", {
            x: getLogoX,
            y: () => window.innerHeight / 2,
            xPercent: 0,
            yPercent: -50,
            duration: 1.25,
            ease: "power4.inOut",
          }, "+=0.18")
          .add(() => Flip.fit(".loader-mark", ".studio-logo", { duration: 0.95, ease: "power4.inOut", scale: true }), "+=0.2")
          .to({}, { duration: 0.95 })
          .to(".loader-progress", { opacity: 0, duration: 0.28, ease: "power2.out" }, "-=0.24")
          .to(".studio-loader", { opacity: 0, duration: 0.5, ease: "power2.out" }, "+=0.08");
      });

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

      motionMedia.add("(pointer: fine)", () => {
        const depthHero = document.querySelector<HTMLElement>(".js-hero-depth");
        const depthLayers = gsap.utils.toArray<HTMLElement>(".js-depth-layer");

        if (!depthHero || !depthLayers.length) return;

        const moveLayers = (event: PointerEvent) => {
          const rect = depthHero.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          depthLayers.forEach((layer) => {
            const depth = Number(layer.dataset.depth ?? 0);
            gsap.to(layer, {
              x: x * depth,
              y: y * depth,
              rotate: x * depth * 0.025,
              duration: 0.8,
              ease: "power3.out",
              overwrite: true,
            });
          });
        };

        depthHero.addEventListener("pointermove", moveLayers);
        return () => depthHero.removeEventListener("pointermove", moveLayers);
      });

      cleanupFns.push(() => motionMedia.revert());
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return (
    <main className="studio-page" id="top">
      {!loaderDone && <StudioLoader />}
      <StudioTopBar />
      <Hero />
      <Method />
      <Services />
      <Questions />
      <StudioFooter />
    </main>
  );
}

function StudioLoader() {
  return (
    <div className="studio-loader" aria-hidden="true">
      <GrainOverlay />
      <div className="loader-mark">small.design</div>
      <div className="loader-progress">
        <NumberTicker value={100} duration={3600} suffix="%" />
      </div>
    </div>
  );
}

function NumberTicker({ value, duration = 1000, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (ref.current) {
        ref.current.textContent = `${value}${suffix}`;
      }
      return;
    }

    const startTime = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * value);

      if (ref.current) {
        ref.current.textContent = `${current}${suffix}`;
      }

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, suffix, value]);

  return <span ref={ref}>0{suffix}</span>;
}

function StudioTopBar() {
  return (
    <header className="studio-topbar">
      <a className="studio-logo" href="#top" aria-label="small.design home">
        small.design
      </a>
      <nav aria-label="Primary">
        <a href="#method">Method</a>
        <a href="#services">Services</a>
        <a href="#questions">Q&A</a>
      </nav>
    </header>
  );
}

function Hero() {
  const [activeZone, setActiveZone] = useState(0);
  const followerRef = useRef<HTMLDivElement>(null);

  const moveFollower = (event: ReactPointerEvent<HTMLElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const nextZone = Math.min(heroZones.length - 1, Math.max(0, Math.floor((x / rect.width) * heroZones.length)));

    setActiveZone(nextZone);
    followerRef.current?.style.setProperty("--cursor-x", `${x}px`);
    followerRef.current?.style.setProperty("--cursor-y", `${y}px`);
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
        <div className="hero-cursor-card js-hero-reveal">
          <img src={heroZones[activeZone].image} alt="" width="1456" height="816" decoding="async" />
          <span>{heroZones[activeZone].line}</span>
        </div>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className="studio-method" id="method">
      <div className="method-blackout" aria-hidden="true" />
      <div className="method-editor">
        <p className="method-kicker js-reveal">Method</p>
        <p className="method-edit" aria-label={content.method}>
          <span>One strong idea, </span>
          <span className="method-cut">reduced until it can carry naming, identity, web, product, and launch </span>
          <span>without noise.</span>
        </p>
        <p className="method-final">Make the company easier to believe in.</p>
      </div>
    </section>
  );
}

function Services() {
  const [activeService, setActiveService] = useState(0);
  const [serviceCardActive, setServiceCardActive] = useState(false);
  const servicesSystemRef = useRef<HTMLDivElement>(null);
  const serviceCardRef = useRef<HTMLElement>(null);
  const selectedService = content.serviceDetails[activeService];
  const moveServiceCard = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = servicesSystemRef.current?.getBoundingClientRect();
    if (!rect) return;

    serviceCardRef.current?.style.setProperty("--service-card-x", `${event.clientX - rect.left}px`);
    serviceCardRef.current?.style.setProperty("--service-card-y", `${event.clientY - rect.top}px`);
  };

  return (
    <section className="studio-services" id="services" aria-label="Services">
      <div className="section-kicker js-reveal">
        <span className="section-label">Services</span>
      </div>
      <div
        className="services-system"
        ref={servicesSystemRef}
        onMouseLeave={() => setServiceCardActive(false)}
        onPointerMove={moveServiceCard}
      >
        <div className="services-list">
          {content.serviceDetails.map((service, index) => (
            <article
              className={`js-reveal${activeService === index ? " is-active" : ""}`}
              key={service.name}
              onBlur={() => setServiceCardActive(false)}
              onFocus={() => {
                setActiveService(index);
                setServiceCardActive(true);
              }}
              onMouseEnter={() => {
                setActiveService(index);
                setServiceCardActive(true);
              }}
              tabIndex={0}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{service.name}</h2>
              <p>{service.signal}</p>
              <div className="service-mobile-detail">
                <img src={service.image} alt="" width="1456" height="816" loading="lazy" decoding="async" />
                <div>
                  <p>{service.detail}</p>
                  <div className="service-output-tags">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside
          className={`service-output${serviceCardActive ? " is-visible" : ""}`}
          ref={serviceCardRef}
          aria-live="polite"
        >
          <img src={selectedService.image} alt="" width="1456" height="816" loading="lazy" decoding="async" />
          <div>
            <p>{selectedService.detail}</p>
            <div className="service-output-tags">
              {selectedService.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Questions() {
  return (
    <section className="studio-questions" id="questions">
      <div className="questions-aside js-reveal">
        <span className="section-label">Questions</span>
        <h2>Before we start.</h2>
      </div>
      <div className="question-list">
        {content.questions.map((item, index) => (
          <details className="js-reveal" key={item.question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{item.question}</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function StudioFooter() {
  return (
    <footer className="studio-footer">
      <img src={content.images.hero} alt="" aria-hidden="true" width="1456" height="816" loading="lazy" decoding="async" />
      <div className="footer-top">
        <span>© 2026 small.design</span>
        <span className="footer-status">All services are online</span>
      </div>
      <div className="studio-footer-word">small.design</div>
    </footer>
  );
}
