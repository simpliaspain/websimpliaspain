import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/sections/HomeHero";
import { HomeAnswer } from "@/components/sections/HomeAnswer";
import { HomeCase } from "@/components/sections/HomeCase";
import { HomePrice } from "@/components/sections/HomePrice";
import { HomeSteps } from "@/components/sections/HomeSteps";
import { FAQSection } from "@/components/sections/FAQSection";
import { PressLine } from "@/components/sections/PressLine";
import { HomeClosing } from "@/components/sections/HomeClosing";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Home, rebuilt from the redesign on 05/11/2026.
 *
 * Six bands separated by hairlines, in this order and no other:
 *
 *   inicio   the question arriving at 20:53, unanswered
 *   accion   the same question answered, beside the 40-second video
 *   caso     one operator's own month, led by the figure
 *   como     four steps from the question to the visit
 *   faq      four operator questions, with the press line under them
 *   empezar  the closing line and the demo
 *
 * What the redesign removed and why, so nobody puts it back by accident:
 * the trust bar, the separate problem section and the method strip (the hero
 * and #accion already are the problem and the method), the services grid
 * (the page sells one service), the "who it's for" grid, and the pricing
 * section - a pricing section with no prices in it subtracts. The longer
 * press block still exists in PressSection and the inner pages use it.
 */
const Index = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Seo titleKey="seo.home.title" descriptionKey="seo.home.description" path="/" />
      {/* Describes the one service the page sells. It reuses the page's own
          meta description rather than the hero subtitle, which opens
          mid-scene and does not stand alone here. */}
      <JsonLd
        data={{
          "@type": "Service",
          name: t("service.whatsapp"),
          serviceType: "Agente de IA de WhatsApp para coworkings y centros de negocio",
          description: t("seo.home.description"),
          url: `${SITE_URL}/`,
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "España" },
        }}
      />
      <Navbar />
      <main>
        <HomeHero />
        <HomeAnswer />
        <HomeCase />
        <HomeSteps />
        <HomePrice />
        <FAQSection titleKey="faq.operatorTitle" items={OPERATOR_FAQ} footer={<PressLine />} />
        <HomeClosing />
      </main>
      <Footer />
    </div>
  );
};

/**
 * The four the redesign kept, in its order: does it read my sheet, what if
 * it doesn't know, how long until it works, where is my data. Three already
 * existed word for word in the shared list and are reused rather than
 * copied; only the sheet question is new. The nine-question list is still
 * what /como-trabajamos and the other pages show.
 */
const OPERATOR_FAQ = [
  ["faq.sheetQ", "faq.sheetA"],
  ["faq.q1", "faq.a1"],
  ["faq.q4", "faq.a4"],
  ["faq.q8", "faq.a8"],
] as const;

export default Index;
