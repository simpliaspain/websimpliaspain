import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

const TOOLS = ["Nexudus", "OfficeRnD", "Cobot", "Spacebring", "Excel"];

/** Who it is for, and the reassurance that nothing in their stack changes. */
export function ForWhoSection() {
  const { t } = useLanguage();
  return (
    <Section id="para-quien" className="relative bg-secondary/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 aria-hidden="true" className="h-7 w-7 text-primary" />
          </span>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("forWho.title")} <span className="text-italic-gradient">{t("forWho.titleEmph")}</span>
          </h2>
          <p className="mt-6 text-lg font-medium text-foreground">{t("forWho.p1")}</p>
          <p className="mt-4 text-muted-foreground">{t("forWho.p2")}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Nexudus, OfficeRnD, Cobot, Spacebring, Excel">
            {TOOLS.map((tool) => (
              <li key={tool} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {tool}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-semibold text-foreground">{t("forWho.p3")}</p>
        </motion.div>
      </div>
    </Section>
  );
}
