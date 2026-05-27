export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black bg-paper/92 px-5 py-4 backdrop-blur md:px-8">
      <a className="brand" href="#top" aria-label="small.design home">
        small.design<span />
      </a>
      <nav className="flex justify-end gap-5 text-sm font-semibold text-neutral-600 md:text-base">
        <a href="#work">Work</a>
        <a href="#method">Method</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
