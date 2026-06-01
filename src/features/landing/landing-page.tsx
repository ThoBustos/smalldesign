import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GrainOverlay } from "@/components/shared/grain-overlay";
import { landingContent } from "@/content/directions";

gsap.registerPlugin(ScrollTrigger);

const content = landingContent;

export function LandingPage() {
  useEffect(() => {
    const context = gsap.context(() => {
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
    });

    return () => context.revert();
  }, []);

  return (
    <main className="studio-page" id="top">
      <StudioTopBar />
      <Hero />
      <Method />
      <Services />
      <Work />
      <Contact />
      <StudioFooter />
    </main>
  );
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
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="studio-hero hero-interface">
      <GrainOverlay />
      <div className="hero-meta js-hero-reveal">
        <span>{content.studio}</span>
      </div>
      <h1>
        <span className="js-hero-reveal">Make</span>
        <span className="js-hero-reveal">belief</span>
        <span className="js-hero-reveal">easier.</span>
      </h1>
      <p className="hero-note js-hero-reveal">{content.headline}</p>
      <img className="hero-float-image js-hero-reveal" src={content.images.hero} alt="Glowing monitor at magic hour" />
    </section>
  );
}

function Method() {
  return (
    <section className="studio-method" id="method">
      <span className="section-label js-reveal">01 / Belief</span>
      <p className="js-reveal">{content.method}</p>
    </section>
  );
}

function Services() {
  return (
    <section className="studio-services" aria-label="Services">
      <span className="section-label js-reveal">02 / System</span>
      <div>
        {content.serviceDetails.map((service, index) => (
          <article className="js-reveal" key={service.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{service.name}</h2>
            <p>{service.signal}</p>
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
      <span className="section-label js-reveal">03 / Surfaces</span>
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

function Contact() {
  return (
    <section className="studio-contact" id="contact">
      <span className="section-label js-reveal">04 / Signal</span>
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
      <div className="footer-bottom">
        <a href={`mailto:${content.email}`}>{content.email}</a>
        <nav aria-label="Footer navigation">
          <a href="#work">Work</a>
          <a href="#method">Method</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
