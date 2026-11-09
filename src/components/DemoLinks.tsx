import { useLanguage } from "@/contexts/LanguageContext";
import { CALL_URL, demoUrl } from "@/lib/site";
import { PRIMARY, OUTLINE } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

/** Where on the site a button sits; sent to Umami as `lugar`. */
export type Lugar =
  | "hero"
  | "menu"
  | "como-trabajamos"
  | "banda-final"
  | "contacto"
  | "agente-whatsapp"
  | "precio";

type LinkProps = {
  lugar: Lugar;
  /** Visible label; defaults to the site-wide one. */
  label?: string;
  className?: string;
};

/**
 * The same button, not asking yet: the outlined shape instead of the solid
 * one, for a place where the action is available but the page has not
 * earned the right to shout about it. Same size, same target, same label,
 * and the same blue the moment it is reached - the quiet state is the page
 * being patient, not the button being half-available.
 */
const QUIET = OUTLINE;

/**
 * The site's main action: the instant demo with the visitor's own website.
 * Every demo button goes through here so each one carries `?o=web` (the
 * channel the team sees in the demos panel) and the same Umami event.
 */
export function DemoLink({ lugar, label, className, quiet = false }: LinkProps & { quiet?: boolean }) {
  const { t } = useLanguage();
  return (
    <a
      href={demoUrl("web")}
      target="_blank"
      rel="noopener"
      data-umami-event="demo"
      data-umami-event-lugar={lugar}
      data-quiet={quiet || undefined}
      className={cn(PRIMARY, quiet && QUIET, className)}
    >
      {label ?? t("cta.demo")}
      <span className="sr-only"> {t("nav.opensNewTab")}</span>
    </a>
  );
}

/** Secondary action: the 15-minute call on Cal.com. */
export function CallLink({
  lugar,
  label,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
}: LinkProps & {
  /** Set by ActionPair, so reaching for this hands it the blue. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <a
      href={CALL_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-umami-event="llamada"
      data-umami-event-lugar={lugar}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(OUTLINE, className)}
    >
      {label ?? t("cta.call")}
      <span className="sr-only"> {t("nav.opensNewTab")}</span>
    </a>
  );
}
