import type { DesignTone } from "@/design/tokens";

type SystemBandProps = {
  children: string;
  tone?: DesignTone;
};

export function SystemBand({ children, tone = "blue" }: SystemBandProps) {
  return (
    <section className={`system-band ${tone}`}>
      <p>{children}</p>
    </section>
  );
}
