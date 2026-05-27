import { services } from "@/content/directions";

type ServiceGridProps = {
  dark?: boolean;
};

export function ServiceGrid({ dark = false }: ServiceGridProps) {
  return (
    <section className={`service-grid ${dark ? "dark" : ""}`}>
      {services.map((service) => (
        <div key={service}>{service}</div>
      ))}
    </section>
  );
}
