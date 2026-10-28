import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

/**
 * The out-of-hours problem. The two figures are the only ones on the site
 * with a published source (Uniti / Vast Coworking, 2026); do not add more
 * without one.
 */
export function ProblemSection() {
  const { t } = useLanguage();
  const stats = [
    { value: t("problem.stat1"), text: t("problem.stat1Text") },
    { value: t("problem.stat2"), text: t("problem.stat2Text") },
  ];

  return (
    <Section id="problema" className="relative bg-secondary/40">
      <div className="container">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              {t("problem.title")}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">{t("problem.text")}</p>
          </motion.div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((s, i) => (
                <motion.div
                  key={s.value}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <p className="text-5xl font-bold tabular-nums text-primary">{s.value}</p>
                  <p className="mt-3 text-sm text-foreground">{s.text}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t("problem.source")}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
