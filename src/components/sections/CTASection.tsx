import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";
import { CallLink, DemoLink } from "@/components/DemoLinks";

/** Closing band on every page: the 23:47 question, the demo and the call. */
export function CTASection() {
  const { t } = useLanguage();

  return (
    <Section id="probar" className="relative overflow-hidden">
      {/* Smooth gradient background that blends with surrounding sections */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-primary/8 blur-[100px]" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("cta.title")} <span className="text-italic-gradient tabular-nums">{t("cta.titleEmph")}</span>?
          </h2>
          <p className="mb-10 text-lg text-muted-foreground">{t("cta.text")}</p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <DemoLink lugar="banda-final" className="h-14 w-full px-10 text-lg sm:w-auto" />
            <CallLink lugar="banda-final" className="h-14 w-full px-8 text-base sm:w-auto" />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
