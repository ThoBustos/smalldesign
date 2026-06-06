import { type PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { content } from "../landing-content";

export function Services() {
  const [activeService, setActiveService] = useState(0);
  const [serviceCardActive, setServiceCardActive] = useState(false);
  const servicesSystemRef = useRef<HTMLDivElement>(null);
  const serviceCardRef = useRef<HTMLDivElement>(null);
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
            <button
              className={`service-row js-reveal${activeService === index ? " is-active" : ""}`}
              key={service.name}
              type="button"
              onBlur={() => setServiceCardActive(false)}
              onFocus={() => {
                setActiveService(index);
                setServiceCardActive(true);
              }}
              onMouseEnter={() => {
                setActiveService(index);
                setServiceCardActive(true);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="service-title">{service.name}</span>
              <p>{service.signal}</p>
              <span className="service-mobile-detail">
                <img src={service.image} alt="" width="1456" height="816" loading="lazy" decoding="async" />
                <span>
                  <p>{service.detail}</p>
                  <span className="service-output-tags">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
        <div
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
        </div>
      </div>
    </section>
  );
}
