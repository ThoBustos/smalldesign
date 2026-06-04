type GrainOverlayProps = {
  fixed?: boolean;
};

export function GrainOverlay({ fixed = false }: GrainOverlayProps) {
  return <div className={`grain-overlay${fixed ? " fixed" : ""}`} aria-hidden="true" />;
}
