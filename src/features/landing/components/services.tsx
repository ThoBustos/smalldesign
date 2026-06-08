import { content } from "../landing-content";

export function Services() {
  return (
    <section className="studio-services" id="services" aria-label="Services">
      <div className="section-kicker js-reveal">
        <span className="section-label">Services</span>
        <span>Studio cards</span>
      </div>
      <div className="services-system">
        <div className="services-list">
          {content.serviceDetails.map((service, index) => (
            <article
              className="service-row js-reveal"
              key={service.name}
            >
              <img src={service.image} alt="" width="1456" height="816" loading="lazy" decoding="async" />
              <div className="service-row-meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{service.signal}</strong>
              </div>
              <h3 className="service-title">{service.name}</h3>
              <p>{service.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
