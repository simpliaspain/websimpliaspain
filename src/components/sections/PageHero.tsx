import type { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * The opening band of an inner page, shaped like the home's hero: the
 * headline left-aligned at display size, a lead under it held to a readable
 * measure, and whatever the page wants to put beneath.
 *
 * No entrance animation - this is the page's LCP text, and the redesign does
 * not fade content in - and no wash behind it.
 */
export function PageHero({
  titleKey,
  emphKey,
  subtitleKey,
  children,
}: {
  titleKey: string;
  /** Rendered in brand blue after the title, for pages that want it. */
  emphKey?: string;
  subtitleKey?: string;
  children?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="h-page"
      className="pb-[clamp(24px,3vw,48px)] pt-[clamp(40px,7vw,96px)]"
    >
      <div className="wrap grid gap-[clamp(18px,2vw,26px)]">
        <h1
          id="h-page"
          className="m-0 max-w-[900px] text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.05] text-foreground"
        >
          {t(titleKey)}
          {emphKey && <> <span className="text-brand">{t(emphKey)}</span></>}
        </h1>
        {subtitleKey && (
          <p className="m-0 max-w-[620px] text-pretty text-[clamp(17px,1.4vw,19px)] leading-[1.5] text-muted-foreground">
            {t(subtitleKey)}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
