import { motion } from "framer-motion";
import { Target, Headphones, CreditCard, Users, CheckCircle2, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Section } from "@/components/Section";

export function MethodSection() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Target,
      title: t('method.step1Title'),
      description: t('method.step1Desc'),
      platforms: [
        { icon: Users, color: "text-primary" },
      ],
      badges: [t('method.step1Badge1'), t('method.step1Badge2')],
    },
    {
      icon: Headphones,
      title: t('method.step2Title'),
      description: t('method.step2Desc'),
      platforms: [
        { icon: CheckCircle2, color: "text-green-500" },
      ],
      badges: [t('method.step2Badge1'), t('method.step2Badge2')],
    },
    {
      icon: CreditCard,
      title: t('method.step3Title'),
      description: t('method.step3Desc'),
      platforms: [
        { icon: DollarSign, color: "text-primary" },
      ],
      badges: [t('method.step3Badge1'), t('method.step3Badge2')],
    },
  ];

  return (
    <Section variant="default" id="metodo" className="relative bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            <span className="text-foreground">{t('method.title1')}</span>
            <br />
            <span className="text-italic-gradient">{t('method.title2')} </span>
            <span className="font-normal text-muted-foreground">{t('method.title3')}</span>
          </h2>
        </motion.div>

        {/* Steps Grid. Each card is a subgrid spanning four shared rows
            (marker, title, description, tags), so every section starts
            at the same Y in every card whatever its copy runs to, in either
            locale and at any width - no fixed heights. The card's own gap-y-0
            keeps its internal spacing to the margins below. */}
        <div className="grid lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative grid grid-rows-subgrid row-span-4 gap-y-0 bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-200 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Step numeral: editorial numbering, not a badge. Zero-padded
                  so it reads as a series even on one card; no ring, no
                  container, no "PASO" - the numeral and its position carry
                  the sequence. 36px bold brand blue (text-4xl, the site's
                  scale): large text, which needs 3:1, and --primary on the
                  card is 3.80:1. Screen readers hear "Paso 1", not "01". */}
              <div className="mb-3 text-4xl font-bold leading-none tabular-nums text-primary">
                <span className="sr-only">{t('method.stepLabel')} {index + 1}</span>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {step.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Decorative gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}