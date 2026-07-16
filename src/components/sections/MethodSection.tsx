import { motion } from "framer-motion";
import { Target, Headphones, CreditCard, Sparkles, Users, CheckCircle2, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function MethodSection() {
  const { t } = useLanguage();

  const steps = [
    {
      step: t('method.step1'),
      icon: Target,
      title: t('method.step1Title'),
      description: t('method.step1Desc'),
      platforms: [
        { icon: Users, color: "text-primary" },
      ],
      badges: [t('method.step1Badge1'), t('method.step1Badge2')],
    },
    {
      step: t('method.step2'),
      icon: Headphones,
      title: t('method.step2Title'),
      description: t('method.step2Desc'),
      platforms: [
        { icon: CheckCircle2, color: "text-green-500" },
      ],
      badges: [t('method.step2Badge1'), t('method.step2Badge2')],
    },
    {
      step: t('method.step3'),
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
    <section id="metodo" className="py-24 md:py-32 relative bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('method.badge')}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            <span className="text-foreground">{t('method.title1')}</span>
            <br />
            <span className="text-italic-gradient">{t('method.title2')} </span>
            <span className="font-normal text-muted-foreground">{t('method.title3')}</span>
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-200 overflow-hidden hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {step.step}
                </span>
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
    </section>
  );
}