import { ContactPanel } from "@/components/shared/contact-panel";
import { InterfaceObject } from "@/components/shared/interface-object";
import { SystemBand } from "@/components/shared/system-band";
import { systemCases, systemProofs } from "@/content/directions";

export function SystemDirection() {
  return (
    <div className="direction system" id="top">
      <section className="system-hero">
        <div>
          <span className="hero-label">Brand x product x web</span>
          <h1>A small studio for companies between idea and scale.</h1>
        </div>
        <InterfaceObject />
      </section>

      <SystemBand tone="black">identity -&gt; page -&gt; product -&gt; deck -&gt; launch -&gt; identity -&gt;</SystemBand>

      <section id="work" className="system-cases">
        {systemCases.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <h2>{item.title}</h2>
            <p>{item.copy}</p>
          </article>
        ))}
      </section>

      <section id="method" className="system-proof">
        {systemProofs.map((proof) => (
          <div key={proof}>{proof}</div>
        ))}
      </section>

      <ContactPanel title="Show the product clearly." />
    </div>
  );
}
