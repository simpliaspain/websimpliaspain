import { useLanguage } from "@/contexts/LanguageContext";
import { PHONE_MAIN } from "@/lib/site";
import { DemoLink } from "@/components/DemoLinks";
import { Reveal } from "@/components/Reveal";

/**
 * The last thing on the page is the first thing again: tonight, someone like
 * Marta is going to ask about an office. One button, and a phone number for
 * the readers who would rather talk to a person.
 */
export function HomeClosing() {
  const { t } = useLanguage();

  return (
    <section
      id="empezar"
      aria-labelledby="h-final"
      className="scroll-mt-[68px] border-t border-border py-[clamp(64px,9vw,136px)]"
    >
      <Reveal className="wrap grid gap-7">
        <h2
          id="h-final"
          className="m-0 max-w-[900px] text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.05] tracking-[-0.035em] text-foreground"
        >
          {t("closing.title")}
        </h2>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <DemoLink lugar="banda-final" />
          <span className="flex min-h-[44px] flex-wrap items-center gap-x-[0.3em] text-[17px] font-semibold text-foreground">
            {t("closing.orCall")}
            <a href={PHONE_MAIN.href} className="flex min-h-[44px] items-center underline underline-offset-4">
              {PHONE_MAIN.display}
            </a>
          </span>
        </div>
      </Reveal>
    </section>
  );
}
