import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn("inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white p-1", className)}
    {...props}
  />
);

const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      "rounded-full px-4 py-2 text-sm font-semibold text-neutral-500 data-[state=active]:bg-neutral-950 data-[state=active]:text-white",
      className,
    )}
    {...props}
  />
);

const TabsContent = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content className={cn("outline-none", className)} {...props} />
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
