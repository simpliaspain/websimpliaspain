import { motion } from "framer-motion";
import { Check, CircleDot } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CallLink, DemoLink } from "@/components/DemoLinks";
import { useLanguage } from "@/contexts/LanguageContext";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

const FAQ_ITEMS = [1, 2, 3, 4].map((n) => [`howWeWork.q${n}`, `howWeWork.a${n}`] as const);

/**
 * How we work with a centre - deliberately NOT a pricing page. Simplia has
 * no plans or packages: every proposal is tailored, so the page explains the
 * path and what the price depends on, and publishes no figure. The Service
 * JSON-LD carries no `offers` for the same reason.
 */
export default function ComoTrabajamos() {
  const { t } = useLanguage();

  const steps = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`howWeWork.step${n}Title`),
    description: t(`howWeWork.step${n}Desc`),
    action:
      n === 1 ? <DemoLink lugar="como-trabajamos" label={t("howWeWork.step1Cta")} size="default" className="mt-4" />
      : n === 2 ? <CallLink lugar="como-trabajamos" label={t("howWeWork.step2Cta")} size="default" className="mt-4" />
      : null,
  }));
  const depends = [1, 2, 3, 4].map((n) => t(`howWeWork.depends${n}`));
  const includes = [1, 2, 3, 4, 5, 6].map((n) => t(`howWeWork.includes${n}`));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo titleKey="seo.howWeWork.title" descriptionKey="seo.howWeWork.description" path="/como-trabajamos" />
      <JsonLd
        data={{
          "@type": "Service",
          name: t("service.whatsapp"),
          serviceType: "Agente de IA de WhatsApp para coworkings y centros de negocio",
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "España" },
          url: `${SITE_URL}/como-trabajamos`,
        }}
      />
      <Navbar />
      <main>
        <section className="relative overflow-hidden pb-16 pt-32 md:pb-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="container relative z-10">
            {/* No entrance fade: this block is the page's LCP text. */}
            <motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                {t("howWeWork.title")} <span className="text-italic-gradient">{t("howWeWork.titleEmph")}</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">{t("howWeWork.subtitle")}</p>
            </motion.div>

            {/* A real sequence, so it is numbered. */}
            <ol className="mx-auto mt-16 max-w-3xl space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-5 rounded-2xl border border-border bg-card p-6">
                  <span className="text-3xl font-bold leading-none tabular-nums text-primary">
                    <span className="sr-only">{t("how.stepLabel")} {index + 1}</span>
                    <span aria-hidden="true">{index + 1}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                    {step.action}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-secondary/40 py-20 md:py-28">
          <div className="container">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="mb-5 text-2xl font-bold text-foreground">{t("howWeWork.dependsTitle")}</h2>
                <ul className="space-y-3">
                  {depends.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-sm text-foreground">
                      <CircleDot aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border-2 border-primary/30 bg-card p-8">
                <h2 className="mb-5 text-2xl font-bold text-foreground">{t("howWeWork.includesTitle")}</h2>
                <ul className="space-y-3">
                  {includes.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-sm text-foreground">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
        <FAQSection items={FAQ_ITEMS} titleKey="howWeWork.faqTitle" />
      </main>
      <Footer />
    </div>
  );
}
