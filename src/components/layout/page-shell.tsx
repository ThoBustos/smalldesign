import { SiteHeader } from "@/components/layout/site-header";
import { PlaneDirection } from "@/features/directions/plane-direction";

export function PageShell() {
  return (
    <div className="min-h-screen bg-paper text-black">
      <SiteHeader />
      <PlaneDirection />
    </div>
  );
}
