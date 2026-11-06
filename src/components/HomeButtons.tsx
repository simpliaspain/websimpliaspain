import { useLanguage } from "@/contexts/LanguageContext";
import { OUTLINE } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

/**
 * Jumps to the video in #accion. It is the hero's second action, so it takes
 * the outlined shape and carries the only glyph on the page - a triangle
 * drawn with borders, which needs no icon set and scales with the text.
 */
export function WatchButton({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <a href="#video" className={cn(OUTLINE, "pl-[18px] pr-[22px]", className)} data-umami-event="ver-video">
      <span
        aria-hidden="true"
        className="block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-current"
      />
      {t("cta.watch")}
    </a>
  );
}
