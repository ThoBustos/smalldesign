import { CasePanel } from "@/components/shared/case-panel";
import { ContactPanel } from "@/components/shared/contact-panel";
import { ServiceGrid } from "@/components/shared/service-grid";
import { SystemBand } from "@/components/shared/system-band";
import { signalCases } from "@/content/directions";

export function SignalDirection() {
  return (
    <div className="direction signal" id="top">
      <section className="signal-hero">
        <div className="hero-label">Identity / websites / product surfaces</div>
        <h1>We make less. It does more.</h1>
        <p>Small design systems for focused companies: the marks, words, pages, and product moments that carry the most weight.</p>
      </section>

      <SystemBand>position -&gt; identity -&gt; website -&gt; product -&gt; launch -&gt;</SystemBand>

      <section id="work" className="signal-work">
        {signalCases.map((item) => (
          <CasePanel key={item.number} {...item} />
        ))}
      </section>

      <section id="method" className="method-split">
        <span>Method</span>
        <h2>We remove the agency layer and keep the senior work close to the problem.</h2>
        <p>Strategy, writing, identity, and interface decisions happen together. The output is smaller: tighter positioning, fewer templates, clearer pages, better handoff.</p>
      </section>

      <ServiceGrid />
      <ContactPanel title="Bring the important work." />
    </div>
  );
}
