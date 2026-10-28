import { motion } from "framer-motion";
import { Clock, Tag, DoorOpen, CalendarCheck, BellRing, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import demoVideo from "@/assets/services/simplia-demo-1024.mp4";
import demoPoster from "@/assets/services/simplia-demo-poster-1024.webp";
import { ServiceDemoVideo } from "@/components/ServiceDemoVideo";
import { Section } from "@/components/Section";

/**
 * "What it does for your centre": the product demo video beside six short
 * capability cards. Only what is in production today - no channels, CRM or
 * voice. The video loads nothing until it nears the viewport (see
 * ServiceDemoVideo).
 */
export function ServicesSection() {
  const { t } = useLanguage();

  const features = [
    { icon: Clock, title: t("features.f1Title"), description: t("features.f1Desc") },
    { icon: Tag, title: t("features.f2Title"), description: t("features.f2Desc") },
    { icon: DoorOpen, title: t("features.f3Title"), description: t("features.f3Desc") },
    { icon: CalendarCheck, title: t("features.f4Title"), description: t("features.f4Desc") },
    { icon: BellRing, title: t("features.f5Title"), description: t("features.f5Desc") },
    { icon: BarChart3, title: t("features.f6Title"), description: t("features.f6Desc") },
  ];

  return (
    <Section id="servicios" className="relative scroll-mt-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            {t("features.title")} <span className="text-italic-gradient">{t("features.titleEmph")}</span>
          </h2>
        </motion.div>

        {/* Video and cards side by side from lg (74rem row, as before: the
            widest box the 1024px encode still covers at 2x), stacked below. */}
        <div className="mx-auto grid max-w-[74rem] items-center gap-8 lg:grid-cols-2">
          <ServiceDemoVideo
            src={demoVideo}
            poster={demoPoster}
            width={1024}
            height={768}
            labelKey="features.videoLabel"
            className="w-full"
          />

          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map((f, index) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon aria-hidden="true" className="h-5 w-5 text-primary" />
                </span>
                <h3 className="font-bold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
