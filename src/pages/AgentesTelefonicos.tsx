import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, CheckCircle2, ArrowRight, Mic, FileText, Users, Clock } from "lucide-react";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

/** Waiting list: the contact form, with the message started for them. */
const WAITLIST_HREF = "/contacto?interes=voz";

/**
 * The phone agent is in beta (not in production), so this page sells a
 * waiting list, not the service. It is out of the main menu and linked from
 * the footer as "Agente telefónico (beta)". The example uses the fictional
 * centre: Laura is Oficinas YA!'s WhatsApp agent and does not take calls.
 */
export default function AgentesTelefonicos() {
  const { t } = useLanguage();

  const features = [
    { icon: Mic, title: t("agents.feature1Title"), description: t("agents.feature1Desc") },
    { icon: Calendar, title: t("agents.feature2Title"), description: t("agents.feature2Desc") },
    { icon: FileText, title: t("agents.feature3Title"), description: t("agents.feature3Desc") },
    { icon: Users, title: t("agents.feature4Title"), description: t("agents.feature4Desc") },
  ];

  const benefits = [
    t("agents.benefit1"),
    t("agents.benefit2"),
    t("agents.benefit3"),
    t("agents.benefit4"),
    t("agents.benefit5"),
    t("agents.benefit6"),
  ];

  const useCases = [
    { title: t("agents.useCase1Title"), description: t("agents.useCase1Desc") },
    { title: t("agents.useCase2Title"), description: t("agents.useCase2Desc") },
    { title: t("agents.useCase3Title"), description: t("agents.useCase3Desc") },
  ];

  const preview = [
    { from: "agent", text: t("agents.previewM1") },
    { from: "client", text: t("agents.previewM2") },
    { from: "agent", text: t("agents.previewM3") },
  ];

  const waitlistButton = (className: string) => (
    <Button asChild size="lg" className={className}>
      <Link to={WAITLIST_HREF} data-umami-event="lista-voz">
        {t("agents.waitlist")}
        <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo titleKey="seo.agents.title" descriptionKey="seo.agents.description" path="/agentes-telefonicos" />
      <JsonLd
        data={{
          "@type": "Service",
          name: `${t("agents.badge")} (${t("agents.beta")})`,
          description: t("agents.heroDesc"),
          url: `${SITE_URL}/agentes-telefonicos`,
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
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {t("agents.beta")}
                </p>
                <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                  {t("agents.heroTitle1")} <span className="text-italic-gradient">{t("agents.heroTitle2")}</span> {t("agents.heroTitle3")}
                </h1>
                <p className="mb-8 max-w-xl text-lg text-muted-foreground">{t("agents.heroDesc")}</p>
                {waitlistButton("h-12 bg-primary text-primary-foreground hover:bg-primary/90")}
              </motion.div>

              {/* Example call, fictional centre, no prices. */}
              <div aria-hidden="true" className="relative hidden lg:block">
                <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25)]">
                  <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <Phone className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t("example.center")}</p>
                        <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-500">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 motion-reduce:animate-none" />
                          {t("demo.callInProgress")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm tabular-nums text-muted-foreground">00:41</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {preview.map((m) => (
                      <div key={m.text} className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${m.from === "agent" ? "bg-primary/10" : "bg-accent"}`}>
                          {m.from === "agent" ? <Mic className="h-4 w-4 text-primary" /> : <Users className="h-4 w-4 text-accent-foreground" />}
                        </div>
                        <div className={`flex-1 rounded-xl px-4 py-3 ${m.from === "agent" ? "bg-secondary" : "bg-primary/10"}`}>
                          <p className="text-sm text-foreground">«{m.text}»</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">{t("example.footnote")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-secondary/30 py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                {t("agents.featuresTitle1")} <span className="text-italic-gradient">{t("agents.featuresTitle2")}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("agents.featuresSubtitle")}</p>
            </motion.div>

            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.li
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border-2 border-border bg-card p-6"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <feature.icon aria-hidden="true" className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Who it is for */}
        <section className="bg-background py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                <span className="text-italic-gradient">{t("agents.useCasesTitle")}</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("agents.useCasesSubtitle")}</p>
            </motion.div>

            <ul className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {useCases.map((useCase, index) => (
                <motion.li
                  key={useCase.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border-2 border-border bg-card p-8"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Phone aria-hidden="true" className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground">{useCase.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{useCase.description}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits + waiting list */}
        <section className="bg-secondary/30 py-20 md:py-32">
          <div className="container">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                  {t("agents.benefitsSectionTitle")} <span className="text-italic-gradient">{t("agents.benefitsSectionTitle2")}</span>
                </h2>
                <p className="mb-8 text-lg text-muted-foreground">{t("agents.benefitsSectionDesc")}</p>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-green-600 dark:text-green-500" />
                      </span>
                      <span className="text-sm font-medium text-foreground">{benefit}</span>
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
                  <Phone aria-hidden="true" className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">{t("agents.readyCard")}</h3>
                <p className="mb-6 text-muted-foreground">{t("agents.readyCardDesc")}</p>
                {waitlistButton("h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90")}
              </motion.div>
            </div>
          </div>
        </section>

        <FAQSection voice />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
