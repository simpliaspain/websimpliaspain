import { useLanguage } from "@/contexts/LanguageContext";
import { demoUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Lugar } from "@/components/DemoLinks";

/**
 * The redesign has exactly two button shapes, both 56px tall with an 8px
 * corner: a solid blue one for the demo and an outlined one beside it. They
 * live here rather than in the shadcn Button so the sizes cannot drift, and
 * so every demo link keeps `?o=web` and the same Umami event.
 */
const BASE =
  "inline-flex min-h-[56px] items-center justify-center gap-3 rounded-md text-[18px] font-bold no-underline transition-colors duration-150 motion-reduce:transition-none";

export const PRIMARY = `${BASE} bg-primary px-[26px] text-primary-foreground hover:bg-[hsl(210_100%_36%)] active:scale-[0.97] motion-reduce:active:scale-100`;
export const OUTLINE = `${BASE} border border-[hsl(216_5%_57%)] px-[22px] text-foreground hover:border-foreground`;

export function DemoButton({ lugar, className }: { lugar: Lugar; className?: string }) {
  const { t } = useLanguage();
  return (
    <a
      href={demoUrl("web")}
      target="_blank"
      rel="noopener"
      data-umami-event="demo"
      data-umami-event-lugar={lugar}
      className={cn(PRIMARY, className)}
    >
      {t("cta.demo")}
      <span className="sr-only"> {t("nav.opensNewTab")}</span>
    </a>
  );
}

/** Jumps to the video in #accion and starts it. */
export function WatchButton({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <a href="#video" className={cn(OUTLINE, "pl-[18px]", className)} data-umami-event="ver-video">
      <span
        aria-hidden="true"
        className="block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-current"
      />
      {t("cta.watch")}
    </a>
  );
}
