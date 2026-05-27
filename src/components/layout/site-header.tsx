import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const directions = ["Signal", "Index", "System"];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center border-b border-black bg-paper/92 px-5 py-4 backdrop-blur md:px-8">
      <a className="brand" href="#top" aria-label="small.design home">
        small.design<span />
      </a>
      <TabsList className="hidden md:inline-flex">
        {directions.map((direction) => (
          <TabsTrigger key={direction} value={direction.toLowerCase()}>
            {direction}
          </TabsTrigger>
        ))}
      </TabsList>
      <nav className="flex justify-end gap-5 text-sm font-semibold text-neutral-600 md:text-base">
        <a href="#work">Work</a>
        <a href="#method">Method</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}

export function MobileDirectionSwitcher() {
  return (
    <div className="border-b border-black bg-paper px-4 py-3 md:hidden">
      <TabsList className="w-full justify-between">
        {directions.map((direction) => (
          <TabsTrigger key={direction} value={direction.toLowerCase()} className="flex-1">
            {direction}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
