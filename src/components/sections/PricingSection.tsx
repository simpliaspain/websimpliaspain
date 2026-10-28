import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

/**
 * "Getting started". Simplia has no plans or packages: every proposal is
 * tailored, so no figure of ours appears anywhere on the site.
 */
export function PricingSection() {
  const { t } = useLanguage();
  return (
    <Section id="empezar" className="relative bg-secondary/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("pricing.title")} <span className="text-italic-gradient">{t("pricing.titleEmph")}</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">{t("pricing.text")}</p>
          <Button asChild size="lg" variant="outline" className="group mt-8 h-12 border-primary/30 px-8 hover:bg-primary/10">
            <Link to="/como-trabajamos">
              {t("pricing.cta")}
              <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </Section>
  );
}
