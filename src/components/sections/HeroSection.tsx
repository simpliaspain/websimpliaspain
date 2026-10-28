import { motion } from "framer-motion";
import TrustBadge from "@/components/TrustBadge";
import robertoProfile from "@/assets/roberto-profile-2026.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";
import { DemoLink } from "@/components/DemoLinks";
import { ExampleChat } from "@/components/ExampleChat";
import { CALL_URL } from "@/lib/site";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <Section variant="hero" className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-hero">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative z-10 mb-24 mt-8 lg:my-12">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* No entrance fade on the hero: the page is prerendered, so with
              initial opacity 0 the headline (the LCP element) stayed invisible
              until the bundle hydrated. initial={false} renders the final
              state at once; sections further down keep their scroll-in
              animations. */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl xl:text-6xl">
              {t("hero.title")} <span className="text-italic-gradient pr-1">{t("hero.titleEmph")}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              {t("hero.subtitle")}
            </p>

            {/* Primary: the demo with their own site. Secondary: the 15-minute
                call, keeping Roberto's face and the "available" dot - the one
                human touch above the fold. Stacked full width on phones,
                demo first. */}
            <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:items-start sm:justify-center lg:justify-start">
              <div className="flex flex-col items-center gap-1.5">
                <DemoLink lugar="hero" label={t("hero.demoCta")} className="h-14 w-full px-8 text-base sm:w-auto" />
                <span className="text-xs text-muted-foreground">{t("hero.demoNote")}</span>
              </div>
              <TrustBadge asChild>
                <a
                  href={CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-umami-event="llamada"
                  data-umami-event-lugar="hero"
                >
                  <img
                    src={robertoProfile}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full border-2 border-primary/20 object-cover"
                  />
                  <span className="flex flex-col items-start text-left">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {t("hero.available")}
                    </span>
                    <span className="text-sm font-semibold">{t("hero.strategyCall")}</span>
                  </span>
                  <span className="sr-only">{t("nav.opensNewTab")}</span>
                </a>
              </TrustBadge>
            </div>

            <p className="mt-6 max-w-xl text-sm text-muted-foreground">{t("hero.trustLine")}</p>
          </motion.div>

          <ExampleChat className="mx-auto lg:mr-0" />
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </Section>
  );
}
