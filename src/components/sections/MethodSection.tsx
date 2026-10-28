import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

/** "How it works": a real sequence, so it is numbered 1-2-3. */
export function MethodSection() {
  const { t } = useLanguage();

  const steps = [
    { title: t("how.step1Title"), description: t("how.step1Desc") },
    { title: t("how.step2Title"), description: t("how.step2Desc") },
    { title: t("how.step3Title"), description: t("how.step3Desc") },
  ];

  return (
    <Section id="como-funciona" className="relative scroll-mt-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("how.title")} <span className="text-italic-gradient">{t("how.titleEmph")}</span>
          </h2>
        </motion.div>

        {/* Each card is a subgrid spanning three shared rows (numeral, title,
            description), so every part starts at the same Y in every card
            whatever its copy runs to, in either locale and at any width. */}
        <ol className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative grid grid-rows-subgrid row-span-3 gap-y-0 overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              {/* Step numeral: 36px bold brand blue, large text at 3.80:1 on
                  the card. Screen readers hear "Paso 1", not "01". */}
              <div className="mb-3 text-4xl font-bold leading-none tabular-nums text-primary">
                <span className="sr-only">{t("how.stepLabel")} {index + 1}</span>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.li>
          ))}
        </ol>

        <p className="mt-8 flex items-start gap-3 text-base text-foreground md:items-center">
          <LayoutDashboard aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary md:mt-0" />
          {t("how.panelLine")}
        </p>
      </div>
    </Section>
  );
}
