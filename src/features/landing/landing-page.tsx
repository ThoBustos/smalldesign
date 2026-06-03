import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GrainOverlay } from "@/components/shared/grain-overlay";
import { landingContent } from "@/content/landing";

gsap.registerPlugin(ScrollTrigger, Flip);

const content = landingContent;

export function LandingPage() {
  const [loaderDone, setLoaderDone] = useState(false);

  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    const context = gsap.context(() => {
      const loaderTimeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setLoaderDone(true),
      });

      const getLogoRect = () => document.querySelector<HTMLElement>(".studio-logo")?.getBoundingClientRect();
      const getLogoX = () => getLogoRect()?.left ?? 54;
      const getIntroScale = () => {
        const loaderMark = document.querySelector<HTMLElement>(".loader-mark");
        if (!loaderMark) return 4.5;
        const width = loaderMark.getBoundingClientRect().width || 1;
        return Math.min(Math.max((window.innerWidth * 0.34) / width, 3.2), 5.4);
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

      loaderTimeline
        .call(syncLoaderTypography)
        .set(".loader-mark", {
          x: () => window.innerWidth / 2,
          y: () => window.innerHeight / 2,
          xPercent: -50,
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

      const depthHero = document.querySelector<HTMLElement>(".js-hero-depth");
      const depthLayers = gsap.utils.toArray<HTMLElement>(".js-depth-layer");

      if (depthHero && depthLayers.length) {
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
        cleanupFns.push(() => depthHero.removeEventListener("pointermove", moveLayers));
      }
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
      <ProofMosaic />
      <Services />
      <Work />
      <Questions />
      <Contact />
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
        <a href="#work">Work</a>
        <a href="#method">Method</a>
        <a href="#questions">Q&A</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="studio-hero hero-depth js-hero-depth">
      <GrainOverlay />
      <div className="hero-meta js-hero-reveal">
        <span>{content.studio}</span>
      </div>
      <div className="hero-showcase js-hero-reveal" aria-hidden="true">
        <div className="hero-image-frame js-depth-layer" data-depth="14">
          <img src={content.images.hero} alt="" />
        </div>
        <div className="hero-service-rail">
          {content.services.map((service, index) => (
            <span key={service}>
              {String(index + 1).padStart(2, "0")} {service}
            </span>
          ))}
        </div>
      </div>
      <h1>
        <span className="js-hero-reveal">Belief</span>
        <span className="js-hero-reveal">made</span>
        <span className="js-hero-reveal">visible.</span>
      </h1>
      <p className="hero-note js-hero-reveal">{content.headline}</p>
    </section>
  );
}

function Method() {
  return (
    <section className="studio-method" id="method">
      <span className="section-label js-reveal">002 / Method</span>
      <p className="js-reveal">{content.method}</p>
    </section>
  );
}

function ProofMosaic() {
  return (
    <section className="proof-mosaic" aria-label="Creative system proof">
      <div className="proof-tile proof-intro js-reveal">
        <span>003 / Taste engine</span>
        <h2>Building belief into creative systems.</h2>
        <p>Private critique, visual scoring, and product surfaces under one senior design framework.</p>
      </div>
      <div className="proof-video js-reveal">
        <video src={content.images.motion} autoPlay muted loop playsInline poster={content.images.hands} />
      </div>
      {content.proofTiles.map((tile, index) => (
        <article className={`proof-tile proof-tile-${index + 1} js-reveal`} key={tile.title}>
          <span>{String(index + 1).padStart(3, "0")} / module</span>
          <h3>{tile.title}</h3>
          <p>{tile.text}</p>
        </article>
      ))}
      <div className="proof-pattern" aria-hidden="true" />
    </section>
  );
}

function Services() {
  return (
    <section className="studio-services" aria-label="Services">
      <div className="section-kicker js-reveal">
        <span className="section-label">003 / Services</span>
        <span>Designed as an operating layer, not a task list.</span>
      </div>
      <div className="services-list">
        {content.serviceDetails.map((service, index) => (
          <article className="js-reveal" key={service.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{service.name}</h2>
            <p>{service.signal}</p>
            <div className="service-expand">
              <strong>{service.count} // outputs</strong>
              <p>{service.detail}</p>
              <ul>
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
            <img src={service.image} alt="" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="studio-work" id="work">
      <span className="section-label js-reveal">004 / Surfaces</span>
      <figure className="js-reveal">
        <img src={content.images.hands} alt="Hand on keyboard with painterly color" />
        <figcaption>Product surface</figcaption>
      </figure>
      <figure className="js-reveal">
        <img src={content.images.critique} alt="Two people pointing during design critique" />
        <figcaption>Design critique</figcaption>
      </figure>
    </section>
  );
}

function Questions() {
  return (
    <section className="studio-questions" id="questions">
      <div className="questions-aside js-reveal">
        <span className="section-label">005 / Questions</span>
        <h2>Answer the useful objections.</h2>
        <p>Short, plain answers for teams deciding whether a senior design function is worth adding now.</p>
      </div>
      <div className="question-list">
        {content.questions.map((item, index) => (
          <details className="js-reveal" key={item.question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.question}
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="studio-contact" id="contact">
      <span className="section-label js-reveal">006 / Contact</span>
      <p className="js-reveal">Retainer model for tech companies that need senior design direction without adding noise.</p>
      <a className="js-reveal" href={`mailto:${content.email}`}>
        {content.cta}
      </a>
    </section>
  );
}

function StudioFooter() {
  return (
    <footer className="studio-footer">
      <img src={content.images.hero} alt="" aria-hidden="true" />
      <div className="footer-top">
        <span>© 2026 small.design</span>
        <span className="footer-status">All services are online</span>
      </div>
      <div className="studio-footer-word">small.design</div>
    </footer>
  );
}
