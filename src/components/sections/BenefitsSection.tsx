import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Check, Award, Video, Users, Mic, Clock, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function BenefitsSection() {
  const { t } = useLanguage();

  const othersDownsides = [
    t('benefits.other1'),
    t('benefits.other2'),
    t('benefits.other3'),
    t('benefits.other4'),
    t('benefits.other5'),
    t('benefits.other6'),
  ];

  const ourAdvantages = [
    { text: t('benefits.our1'), icon: Award },
    { text: t('benefits.our2'), icon: Video },
    { text: t('benefits.our3'), icon: Users },
    { text: t('benefits.our4'), icon: Mic },
    { text: t('benefits.our5'), icon: Clock },
    { text: t('benefits.our6'), icon: Zap },
  ];

  return (
    <section id="beneficios" className="py-24 md:py-32 relative overflow-hidden">
      {/* Smooth gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/40 to-background" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider mb-4 block">
            {t('benefits.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t('benefits.title')}
          </h2>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Others Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8"
          >
            <h3 className="text-lg font-semibold text-muted-foreground mb-6">{t('benefits.others')}</h3>
            <ul className="space-y-4">
              {othersDownsides.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Our Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-card border-2 border-primary/30 rounded-2xl p-8 relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <span className="text-foreground">Simplia</span>
                  <span className="text-primary">Spain</span>
                  <span className="text-primary text-sm align-super">®</span>
                </div>
              </div>
              
              <ul className="space-y-4">
                {ourAdvantages.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/contacto">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-xl group"
            >
              {t('benefits.scheduleCall')}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
