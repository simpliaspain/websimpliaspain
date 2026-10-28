import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

/**
 * The Oficinas YA! case, in its no-figures version. When the return report
 * gives real numbers (ENCARGO-WEB.md, block B), two of them go here with a
 * link to /casos/oficinasya. Until then: what Laura does, nothing counted.
 */
export function CaseSection() {
  const { t } = useLanguage();
  const points = [t("case.point1"), t("case.point2"), t("case.point3"), t("case.point4")];

  return (
    <Section id="caso" className="relative scroll-mt-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative mx-auto grid max-w-5xl gap-10 overflow-hidden rounded-3xl border-2 border-primary/30 bg-card p-8 md:p-12 lg:grid-cols-[1.2fr_1fr]"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
              {t("case.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
              {t("case.title")} <span className="text-italic-gradient">{t("case.titleEmph")}</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("case.text")}</p>
          </div>
          <ul className="relative flex flex-col justify-center gap-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-foreground">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
                <span className="text-sm font-medium">{p}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Section>
  );
}
