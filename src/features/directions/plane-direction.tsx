import { ConceptServiceList } from "@/components/shared/concept-service-list";
import { ContactPanel } from "@/components/shared/contact-panel";
import { planeDirection } from "@/content/directions";

const content = planeDirection;

export function PlaneDirection() {
  return (
    <div className="direction concept plane-concept" id="top">
      <section className="plane-hero">
        <img src={content.image} alt="Matte black rectangular plane standing in a warm white space" />
        <div className="plane-copy">
          <div className="concept-kicker">
            <span>{content.label}</span>
            <span>{content.signature}</span>
          </div>
          <h1>{content.headline}</h1>
          <p>{content.copy}</p>
        </div>
      </section>

      <section id="method" className="plane-method">
        <span>Method</span>
        <p>One strong idea, reduced until it can carry naming, identity, web, product, and launch without noise.</p>
      </section>

      <ConceptServiceList items={content.services} dark />
      <ContactPanel title="Give the brand a shape people remember." />
    </div>
  );
}
