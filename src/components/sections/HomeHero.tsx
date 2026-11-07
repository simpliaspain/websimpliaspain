import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExampleChat } from "@/components/ExampleChat";
import { DemoLink } from "@/components/DemoLinks";
import { WatchButton } from "@/components/HomeButtons";

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

  /**
   * Only one of the two is ever the blue one, and it is the one the pointer
   * is on. "Pruébalo con tu web" is blue at rest, because it is what the
   * page is asking for; reach for the second button and the first hands the
   * blue over for as long as you are there, then takes it back. Two solid
   * blue buttons side by side would be the page asking for two things at
   * once, and neither would read as the answer.
   *
   * It is the same `quiet` state the button already has, so the swap is the
   * colour transition both shapes already carry - nothing new moves.
   */
  const [watchWanted, setWatchWanted] = useState(false);

  return (
    <section
      id="inicio"
      aria-labelledby="h-inicio"
      className="pb-[clamp(56px,8vw,120px)] pt-[clamp(40px,7vw,112px)]"
    >
      {/* Three items rather than two columns. Stacked, they read in the order
          that makes the argument: the hour and the question, then the message
          with nobody to take it, and only then the two ways to answer it -
          the buttons used to sit between the headline and the thing the
          headline is about. Side by side from lg, the buttons go back under
          the headline and the card takes the other column whole. */}
      <div className="wrap grid gap-x-[clamp(36px,5vw,80px)] gap-y-[clamp(26px,4vw,40px)] lg:grid-cols-[1.25fr_minmax(0,1fr)] lg:[grid-template-rows:auto_auto] lg:items-center">
        <h1
          id="h-inicio"
          className="m-0 min-w-0 text-[clamp(32px,4.2vw,56px)] font-bold leading-[1.05] text-foreground lg:col-start-1 lg:row-start-1 lg:self-end"
        >
          {/* The hour is the hook, so it leads and it is the only blue on
              the page at this size. The full stop after it stays black. */}
          <span className="text-brand tabular-nums">{t("hero.time")}</span>. {t("hero.title")}
        </h1>

        <ExampleChat
          variant="unanswered"
          className="mx-auto w-full min-w-0 max-w-[440px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
        />

        <div className="flex flex-wrap gap-3 lg:col-start-1 lg:row-start-2 lg:mt-[clamp(18px,2vw,26px)] lg:self-start">
          <DemoLink lugar="hero" quiet={watchWanted} />
          <WatchButton
            onPointerEnter={() => setWatchWanted(true)}
            onPointerLeave={() => setWatchWanted(false)}
          />
        </div>
      </div>
    </section>
  );
}
