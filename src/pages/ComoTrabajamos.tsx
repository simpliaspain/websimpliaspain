import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/sections/PageHero";
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
 *
 * Rebuilt in the redesign's language on 06/11/2026: hairline bands, the
 * headline left-aligned at display size, the five steps as numbered rules
 * instead of cards, and the two lists side by side with no boxes or icons.
 */
export default function ComoTrabajamos() {
  const { t } = useLanguage();

  const steps = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`howWeWork.step${n}Title`),
    description: t(`howWeWork.step${n}Desc`),
    action:
      n === 1 ? <DemoLink lugar="como-trabajamos" label={t("howWeWork.step1Cta")} />
      : n === 2 ? <CallLink lugar="como-trabajamos" label={t("howWeWork.step2Cta")} />
      : null,
  }));
  const depends = [1, 2, 3, 4].map((n) => t(`howWeWork.depends${n}`));
  const includes = [1, 2, 3, 4, 5, 6].map((n) => t(`howWeWork.includes${n}`));

  const listItem = "border-b border-border py-3.5 text-foreground";

  return (
    <div className="min-h-screen bg-background">
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
        <PageHero titleKey="howWeWork.title" emphKey="howWeWork.titleEmph" subtitleKey="howWeWork.subtitle" />

        {/* A real sequence, so it is numbered, and each step is a rule rather
            than a card: the number sits in its own column so the titles line
            up down the page. */}
        <section aria-labelledby="h-pasos" className="border-t border-border py-[clamp(56px,8vw,120px)]">
          <div className="wrap">
            <h2 id="h-pasos" className="sr-only">
              {t("howWeWork.stepsTitle")}
            </h2>
            <ol className="m-0 grid list-none border-t border-border p-0">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 border-b border-border py-7 sm:grid-cols-[4rem_minmax(0,1fr)]"
                >
                  <span className="text-[clamp(24px,2.2vw,32px)] font-bold leading-none text-foreground tabular-nums">
                    <span className="sr-only">
                      {t("how.stepLabel")} {index + 1}
                    </span>
                    <span aria-hidden="true">{index + 1}</span>
                  </span>
                  <div className="grid min-w-0 content-start gap-2">
                    <h3 className="m-0 text-[clamp(19px,1.7vw,23px)] font-semibold leading-[1.25] text-foreground">
                      {step.title}
                    </h3>
                    <p className="m-0 max-w-[640px] text-pretty text-muted-foreground">{step.description}</p>
                    {step.action && <div className="mt-2 flex">{step.action}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="h-precio" className="border-t border-border py-[clamp(56px,8vw,120px)]">
          <div className="wrap grid gap-[clamp(28px,4vw,56px)] md:grid-cols-2">
            <div>
              <h2
                id="h-precio"
                className="m-0 mb-5 text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.15] text-foreground"
              >
                {t("howWeWork.dependsTitle")}
              </h2>
              <ul className="m-0 list-none border-t border-border p-0">
                {depends.map((d) => (
                  <li key={d} className={listItem}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="m-0 mb-5 text-[clamp(22px,2.2vw,30px)] font-bold leading-[1.15] text-foreground">
                {t("howWeWork.includesTitle")}
              </h2>
              <ul className="m-0 list-none border-t border-border p-0">
                {includes.map((d) => (
                  <li key={d} className={listItem}>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <FAQSection items={FAQ_ITEMS} titleKey="howWeWork.faqTitle" />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
