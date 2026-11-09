import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/sections/PageHero";
import { CTASection } from "@/components/sections/CTASection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CallLink, DemoLink } from "@/components/DemoLinks";
import { useLanguage } from "@/contexts/LanguageContext";
import { Photo } from "@/components/Photo";
import { cn } from "@/lib/utils";
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

  /**
   * Two of the five steps carry a photograph, and each one belongs to the
   * step it is under rather than to the page: the founders stand with the
   * call you book, because the point of that step is that you talk to them;
   * the office stands with the setting-up, because what we load in is
   * rooms. The other three carry none - a picture on every step would be
   * decoration, and the sequence would stop reading as a sequence.
   */
  const steps = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`howWeWork.step${n}Title`),
    description: t(`howWeWork.step${n}Desc`),
    photo:
      n === 2 ? { name: "equipo", alt: t("contact.teamAlt"), caption: t("contact.teamCaption") }
      : n === 4 ? { name: "despacho-8", alt: t("example.cardAlt"), caption: undefined }
      : null,
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
            up down the page.

            Two columns from lg, because one was the problem: the steps ran
            down the left in a 44% measure and the other half of the page was
            empty from the first step to the last. The heading that was here
            all along as screen-reader-only text now holds that side - it is
            a good heading and it was being hidden - and it stays with you as
            the steps go by, so you always know what you are reading a list
            of. */}
        <section aria-labelledby="h-pasos" className="border-t border-border py-[clamp(56px,8vw,120px)]">
          <div className="wrap grid gap-x-[clamp(28px,5vw,80px)] gap-y-[clamp(28px,4vw,48px)] lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-[92px] lg:self-start">
              <h2
                id="h-pasos"
                className="m-0 max-w-[460px] text-[clamp(26px,2.9vw,40px)] font-bold leading-[1.1] text-foreground"
              >
                {t("howWeWork.stepsTitle")}
              </h2>
            </div>

            <ol className="m-0 grid list-none p-0">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 border-b border-border py-[clamp(24px,3vw,34px)] sm:grid-cols-[3.5rem_minmax(0,1fr)]"
                >
                  {/* The number in the brand blue and at display size: it is
                      the only thing on the page that says this is a path with
                      an order, and at the body's size and ink it read as a
                      bullet. */}
                  <span className="text-[clamp(28px,2.6vw,40px)] font-bold leading-[0.9] text-brand tabular-nums">
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
                    {step.photo && (
                      <figure className="m-0 mt-3 grid max-w-[460px] gap-2">
                        <div
                          className={cn(
                            step.photo.name === "equipo"
                              ? "tinta"
                              : "overflow-hidden rounded-[14px] bg-secondary",
                          )}
                        >
                          <Photo
                            name={step.photo.name}
                            alt={step.photo.alt}
                            width={920}
                            height={613}
                            sizes="(min-width: 1024px) 460px, 90vw"
                            className="aspect-[3/2]"
                          />
                        </div>
                        {step.photo.caption && (
                          <figcaption className="text-sm text-muted-foreground">{step.photo.caption}</figcaption>
                        )}
                      </figure>
                    )}
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
