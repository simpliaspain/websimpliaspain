import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

// `as const` rather than importing the context's Language type: exporting a
// type from that file trips the fast-refresh lint rule for no benefit.
const OPTIONS = [
  { code: "es", label: "ES", switchTo: "Cambiar a español" },
  { code: "en", label: "EN", switchTo: "Switch to English" },
] as const;

/**
 * Two words and a hairline between them (redesign, 06/11/2026). It was a
 * grey pill with a slash and two scaling spans, which belonged to the old
 * site - the new one has no pills and no chrome around text.
 *
 * Two buttons rather than one toggle: each says what it does, the current
 * language is announced with aria-current instead of by its weight alone,
 * and pressing the one you are already in does nothing rather than flipping
 * you somewhere unexpected.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-stretch", className)} role="group" aria-label="Idioma / Language">
      {OPTIONS.map((option, index) => {
        const current = language === option.code;
        return (
          <div key={option.code} className="flex items-stretch">
            {index > 0 && <span aria-hidden="true" className="my-2 w-px self-stretch bg-border" />}
            <button
              type="button"
              lang={option.code}
              onClick={() => setLanguage(option.code)}
              aria-current={current ? "true" : undefined}
              aria-label={current ? undefined : option.switchTo}
              className={cn(
                "flex min-h-[44px] items-center px-3 text-[15px] font-semibold tracking-[0.04em] transition-colors motion-reduce:transition-none",
                current ? "text-foreground" : "text-muted-foreground hover:text-link",
              )}
            >
              {option.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
