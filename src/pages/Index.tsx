import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { MethodSection } from "@/components/sections/MethodSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { ForWhoSection } from "@/components/sections/ForWhoSection";
import { CaseSection } from "@/components/sections/CaseSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { PressSection } from "@/components/sections/PressSection";
import { CTASection } from "@/components/sections/CTASection";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Home, aimed at coworking operators (decided 26/10/2026). Section order
 * follows plan-ventas/presencia-online/ENCARGO-WEB.md, A1: hero, trust,
 * problem, how it works, what it does, who for, the Oficinas YA! case,
 * tailored pricing, FAQ, then press and the closing demo band.
 */
const Index = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Seo titleKey="seo.home.title" descriptionKey="seo.home.description" path="/" />
      {/* Describes the one service the page sells, with the hero's own
          subtitle, so the structured data cannot drift from the page. */}
      <JsonLd
        data={{
          "@type": "Service",
          name: t("service.whatsapp"),
          serviceType: "Agente de IA de WhatsApp para coworkings y centros de negocio",
          description: t("hero.subtitle"),
          url: `${SITE_URL}/`,
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "España" },
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <ProblemSection />
        <MethodSection />
        <ServicesSection />
        <ForWhoSection />
        <CaseSection />
        <PricingSection />
        <FAQSection />
        <PressSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
