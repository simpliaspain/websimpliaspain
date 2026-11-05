import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

/**
 * The Oficinas YA! case, now with the figures the earlier version was waiting
 * for. They are measured over a closed window - October 2026 - rather than
 * read live: the agent keeps working, so a number that moved on its own would
 * sooner or later contradict the client's own panel. The window and what
 * "outside office hours" means are both printed under the figures, because a
 * percentage nobody can define is a percentage nobody has to believe.
 *
 * The quote sits with the numbers as their attribution. On its own it is
 * generic; next to them it is a client confirming what they show.
 */
export function CaseSection() {
  const { t } = useLanguage();
  const points = [t("case.point1"), t("case.point2"), t("case.point3"), t("case.point4")];
  const stats = [
    { value: t("case.stat1Value"), label: t("case.stat1Label") },
    { value: t("case.stat2Value"), label: t("case.stat2Label") },
    { value: t("case.stat3Value"), label: t("case.stat3Label") },
  ];

  return (
    <Section id="caso" className="relative scroll-mt-20 bg-background">
      <div className="container">
        {/* The figure leads: one operator's own month, answering the question
            the hero asks. Large type, so brand blue clears 3:1 here. */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 flex max-w-5xl flex-col items-center gap-x-8 gap-y-3 text-center sm:flex-row sm:text-left"
        >
          <span className="shrink-0 text-6xl font-bold leading-none tracking-tight text-primary tabular-nums md:text-7xl">
            {t("case.statValue")}
          </span>
          <span className="text-xl font-semibold leading-snug text-foreground md:text-2xl">
            {t("case.statText")}
          </span>
        </motion.p>

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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-5xl"
        >
          <dl className="grid gap-6 sm:grid-cols-3">
            {/* Term then value in the markup, so each figure is read once and
                with its label; flex-col-reverse puts the number on top. */}
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse rounded-2xl border border-border bg-card p-6 text-center sm:text-left"
              >
                <dt className="mt-2 text-sm leading-snug text-muted-foreground">{s.label}</dt>
                <dd className="text-4xl font-bold leading-none text-foreground tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>

          <figure className="mt-8 border-l-2 border-primary/40 pl-5">
            <blockquote className="text-lg font-medium leading-snug text-foreground md:text-xl">
              {t("case.quote")}
            </blockquote>
            <figcaption className="mt-2 text-sm text-muted-foreground">{t("case.quoteSource")}</figcaption>
          </figure>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t("case.statsNote")}</p>
        </motion.div>
      </div>
    </Section>
  );
}
