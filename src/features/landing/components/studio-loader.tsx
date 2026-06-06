import { GrainOverlay } from "@/components/shared/grain-overlay";
import { NumberTicker } from "./number-ticker";

export function StudioLoader() {
  return (
    <div className="studio-loader" aria-hidden="true">
      <GrainOverlay />
      <div className="loader-mark">small.design</div>
      <div className="loader-progress">
        <NumberTicker value={100} duration={3600} suffix="%" />
      </div>
    </div>
  );
}
