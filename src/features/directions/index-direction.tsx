import { ArrowUpRight } from "lucide-react";
import { ContactPanel } from "@/components/shared/contact-panel";
import { ServiceGrid } from "@/components/shared/service-grid";
import { SpecimenBoard } from "@/components/shared/specimen-board";
import { indexRows } from "@/content/directions";

export function IndexDirection() {
  return (
    <div className="direction index" id="top">
      <section className="index-hero">
        <p>small.design is a compact identity and interface office for companies that need sharper public shape.</p>
        <h1>Fewer clients. Better proof.</h1>
      </section>

      <SpecimenBoard />

      <section id="method" className="index-rows">
        {indexRows.map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <ArrowUpRight className="h-7 w-7" />
          </article>
        ))}
      </section>

      <ServiceGrid dark />
      <ContactPanel title="Make less. Prove more." tone="light" />
    </div>
  );
}
