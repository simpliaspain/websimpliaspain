import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CALL_URL, demoUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Where on the site a button sits; sent to Umami as `lugar`. */
export type Lugar = "hero" | "menu" | "como-trabajamos" | "banda-final" | "contacto" | "agente-whatsapp";

type LinkProps = {
  lugar: Lugar;
  /** Visible label; defaults to the site-wide one. */
  label?: string;
  className?: string;
  size?: "default" | "lg";
};

/**
 * The site's main action: the instant demo with the visitor's own website.
 * Every demo button goes through here so each one carries `?o=web` (the
 * channel the team sees in the demos panel) and the same Umami event.
 */
export function DemoLink({ lugar, label, className, size = "lg" }: LinkProps) {
  const { t } = useLanguage();
  return (
    <Button asChild size={size} className={cn("group font-semibold", className)}>
      <a
        href={demoUrl("web")}
        target="_blank"
        rel="noopener"
        data-umami-event="demo"
        data-umami-event-lugar={lugar}
      >
        {label ?? t("cta.demo")}
        <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        <span className="sr-only"> {t("nav.opensNewTab")}</span>
      </a>
    </Button>
  );
}

/** Secondary action: the 15-minute call on Cal.com. */
export function CallLink({ lugar, label, className, size = "lg" }: LinkProps) {
  const { t } = useLanguage();
  return (
    <Button asChild size={size} variant="outline" className={cn("border-primary/30 hover:bg-primary/10", className)}>
      <a
        href={CALL_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="llamada"
        data-umami-event-lugar={lugar}
      >
        <Calendar aria-hidden="true" className="mr-1 h-4 w-4 text-primary" />
        {label ?? t("cta.call")}
        <span className="sr-only"> {t("nav.opensNewTab")}</span>
      </a>
    </Button>
  );
}
