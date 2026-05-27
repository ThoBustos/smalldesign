type CasePanelProps = {
  number: string;
  label: string;
  title: string;
  variant: "signal" | "launch";
};

export function CasePanel({ number, label, title, variant }: CasePanelProps) {
  return (
    <article className="case-type">
      <div className="case-meta">
        <span>{number}</span>
        <span>{label}</span>
      </div>
      {variant === "signal" ? <SignalCanvas /> : <LaunchCanvas />}
      <h2>{title}</h2>
    </article>
  );
}

function SignalCanvas() {
  return (
    <div className="case-canvas signal-canvas">
      <div className="axis" />
      <div className="orb" />
      <strong>less</strong>
      <strong>more</strong>
      <small>signal / system / surface</small>
    </div>
  );
}

function LaunchCanvas() {
  return (
    <div className="case-canvas launch-canvas">
      <div>Start here</div>
      <div>Make it legible</div>
      <div>Ship the useful version</div>
    </div>
  );
}
