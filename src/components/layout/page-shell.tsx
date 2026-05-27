import { MobileDirectionSwitcher, SiteHeader } from "@/components/layout/site-header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { IndexDirection } from "@/features/directions/index-direction";
import { SignalDirection } from "@/features/directions/signal-direction";
import { SystemDirection } from "@/features/directions/system-direction";

export function PageShell() {
  return (
    <Tabs defaultValue="signal" className="min-h-screen bg-paper text-black">
      <SiteHeader />
      <MobileDirectionSwitcher />
      <TabsContent value="signal">
        <SignalDirection />
      </TabsContent>
      <TabsContent value="index">
        <IndexDirection />
      </TabsContent>
      <TabsContent value="system">
        <SystemDirection />
      </TabsContent>
    </Tabs>
  );
}
