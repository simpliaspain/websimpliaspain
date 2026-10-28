import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, MessageCircle, Instagram, Send, Globe, Clock3 } from "lucide-react";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { CallLink, DemoLink } from "@/components/DemoLinks";
import { ExampleChat } from "@/components/ExampleChat";

/**
 * How the WhatsApp AI agent works. The URL keeps its old name so existing
 * links still land here. Only WhatsApp is in production; the other channels
 * are listed as "coming soon", without prices or buy buttons.
 */
export default function ChatbotsMulticanal() {
  const { t } = useLanguage();

  const soon = [
    { icon: Instagram, label: t("chatbots.soon1") },
    { icon: Send, label: t("chatbots.soon2") },
    { icon: Globe, label: t("chatbots.soon3") },
  ];

  const benefits = [
    t("chatbots.benefit1"),
    t("chatbots.benefit2"),
    t("chatbots.benefit3"),
    t("chatbots.benefit4"),
    t("chatbots.benefit5"),
    t("chatbots.benefit6"),
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo titleKey="seo.chatbots.title" descriptionKey="seo.chatbots.description" path="/chatbots-multicanal" />
      <JsonLd
        data={{
          "@type": "Service",
          name: t("chatbots.badge"),
          serviceType: "Agente de IA de WhatsApp para coworkings y centros de negocio",
          description: t("chatbots.heroDesc"),
          url: `${SITE_URL}/chatbots-multicanal`,
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "España" },
        }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[80vh] flex-col justify-center overflow-hidden pb-16 pt-32">
          <div className="container relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* No entrance fade on the hero (see HeroSection): the hero text is
                  the LCP element and must be visible in the prerendered HTML. */}
              <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
                <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                  {t("chatbots.heroTitle1")} <span className="text-italic-gradient">{t("chatbots.heroTitle2")}</span>
                </h1>
                <p className="mb-8 max-w-xl text-lg text-muted-foreground">{t("chatbots.heroDesc")}</p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <DemoLink lugar="agente-whatsapp" className="h-12" />
                  <CallLink lugar="agente-whatsapp" className="h-12" />
                </div>
              </motion.div>

              <ExampleChat className="mx-auto lg:mr-0" />
            </div>
          </div>
        </section>

        {/* Channels: WhatsApp today, the rest coming soon */}
        <section className="bg-secondary/30 py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                {t("chatbots.featuresTitle1")} <span className="text-italic-gradient">{t("chatbots.featuresTitle2")}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("chatbots.featuresSubtitle")}</p>
            </motion.div>

            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border-2 border-primary/30 bg-card p-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <MessageCircle aria-hidden="true" className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{t("chatbots.whatsappTitle")}</h3>
                <p className="leading-relaxed text-muted-foreground">{t("chatbots.whatsappDesc")}</p>
              </div>

              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8">
                <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  {t("chatbots.soonTitle")}
                </p>
                <ul className="mb-4 space-y-3">
                  {soon.map((s) => (
                    <li key={s.label} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <s.icon aria-hidden="true" className="h-4 w-4" />
                      {s.label}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">{t("chatbots.soonDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-background py-20 md:py-32">
          <div className="container">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                  {t("chatbots.benefitsTitle1")} <span className="text-italic-gradient">{t("chatbots.benefitsTitle2")}</span>
                </h2>
                <p className="mb-8 text-muted-foreground">{t("chatbots.benefitsDesc")}</p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-border bg-card p-8 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle aria-hidden="true" className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">{t("chatbots.readyCard")}</h3>
                <p className="mb-6 text-muted-foreground">{t("chatbots.readyCardDesc")}</p>
                <DemoLink lugar="agente-whatsapp" size="default" className="h-11 w-full" />
              </motion.div>
            </div>
          </div>
        </section>

        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
