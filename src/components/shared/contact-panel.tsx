import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type ContactPanelProps = {
  title: string;
  tone?: "dark" | "light";
};

export function ContactPanel({ title, tone = "dark" }: ContactPanelProps) {
  return (
    <section id="contact" className={`contact-panel ${tone}`}>
      <h2>{title}</h2>
      <Button asChild variant={tone === "dark" ? "quiet" : "default"} className="h-14 rounded-md px-6 text-lg">
        <a href="mailto:hello@small.design">
          <Mail className="h-5 w-5" />
          hello@small.design
        </a>
      </Button>
    </section>
  );
}
