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

        {/* Steps Grid. Each card is a subgrid spanning five shared rows
            (marker, title, description, icon, tags), so every section starts
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
              className="group relative grid grid-rows-subgrid row-span-5 gap-y-0 bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-200 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Step indicator. The numeral leads the card: a filled
                  primary disc, the same 48px as the icon tile beside it, so
                  it is the heaviest mark in the row - heavier than the
                  tinted tile and unlike the grey word-pills (tags). "Paso"
                  is implied by the heading ("en 3 pasos") and kept for
                  screen readers only. White on primary 4.57:1 (text); the
                  disc on the card 4.57:1 (graphic, 3:1 needed). No rule
                  joins the steps: the cards are bordered and stack below
                  lg, and the subgrid already puts the three discs on one
                  line. */}
              <div className="flex items-center justify-between mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold tabular-nums text-primary-foreground">
                  <span className="sr-only">{t('method.stepLabel')} </span>
                  {index + 1}
                </span>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Platforms */}
              <div className="flex items-center gap-2 mb-4">
                {step.platforms.map((platform, i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
                  >
                    <platform.icon className={`w-4 h-4 ${platform.color}`} />
                  </div>
                ))}
              </div>

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