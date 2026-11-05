import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExampleChat } from "@/components/ExampleChat";
import { Section } from "@/components/Section";

/**
 * The answer to the hero. The hero shows the question arriving at 23:47 with
 * nobody to take it; this repeats the same conversation, answered. Problem and
 * solution share one message, so the reader does not have to hold two
 * different examples in their head.
 *
 * Deliberately media-free: it sits right under the hero, inside the 800px
 * prefetch margin of ServiceDemoVideo, so a video here would be fetched on
 * page load (VIDEO-1). The demo video stays in ServicesSection, far enough
 * down the page that it still costs nothing until the reader approaches it.
 *
 * All static markup, so the whole exchange is in the prerendered HTML.
 */
export function AnswerSection() {
  const { t } = useLanguage();

  return (
    <Section id="respuesta" className="relative scroll-mt-20 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("answer.title")} <span className="text-italic-gradient">{t("answer.titleEmph")}</span>
          </h2>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">{t("answer.text")}</p>
        </motion.div>

        <ExampleChat className="mx-auto mt-12" />
      </div>
    </Section>
  );
}
