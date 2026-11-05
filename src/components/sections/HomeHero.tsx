import { useLanguage } from "@/contexts/LanguageContext";
import { ExampleChat } from "@/components/ExampleChat";
import { DemoButton, WatchButton } from "@/components/HomeButtons";

/**
 * The first screen is the moment, not the promise: 20:53, a question about
 * an office, and a centre that opens tomorrow. The chat beside it shows that
 * same message arriving with nobody to take it; #accion, immediately below,
 * shows it answered.
 *
 * Everything here is static markup, so the whole scene is in the prerendered
 * HTML and readable before any JavaScript runs.
 */
export function HomeHero() {
  const { t } = useLanguage();

  return (
    <section
      id="inicio"
      aria-labelledby="h-inicio"
      className="pb-[clamp(56px,8vw,120px)] pt-[clamp(40px,7vw,112px)]"
    >
      <div className="wrap flex flex-wrap items-center gap-[clamp(36px,5vw,80px)]">
        <div className="grid min-w-0 flex-[1.25_1_520px] gap-[clamp(18px,2vw,26px)]">
          <h1
            id="h-inicio"
            className="m-0 text-[clamp(32px,4.2vw,56px)] font-extrabold leading-[1.05] text-foreground"
          >
            {/* The hour is the hook, so it leads and it is the only blue on
                the page at this size. The full stop after it stays black. */}
            <span className="text-brand tabular-nums">{t("hero.time")}</span>. {t("hero.title")}
          </h1>
          <p className="m-0 max-w-[560px] text-pretty text-[clamp(17px,1.4vw,19px)] leading-[1.5] text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <DemoButton lugar="hero" />
            <WatchButton />
          </div>
        </div>

        <ExampleChat variant="unanswered" className="mx-auto min-w-0 max-w-[440px] flex-[1_1_360px]" />
      </div>
    </section>
  );
}
