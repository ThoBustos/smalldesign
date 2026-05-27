type ConceptServiceListProps = {
  items: readonly string[];
  dark?: boolean;
};

export function ConceptServiceList({ items, dark = false }: ConceptServiceListProps) {
  return (
    <section id="work" className={`concept-service-list ${dark ? "dark" : ""}`}>
      {items.map((item, index) => (
        <article key={item}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h2>{item}</h2>
        </article>
      ))}
    </section>
  );
}
