import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { MethodSection } from "@/components/sections/MethodSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { LogoMarquee } from "@/components/LogoMarquee";
import { PressSection } from "@/components/sections/PressSection";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Seo titleKey="seo.home.title" descriptionKey="seo.home.description" path="/" />
      {/* Describes the one service the page lists (the services card), with
          the card's own strings, so the structured data cannot drift from
          the visible page. Phone agents have their own block on
          /agentes-telefonicos. */}
      <JsonLd
        data={{
          "@type": "Service",
          name: t("services.chatbotsTitle"),
          serviceType: "Automatización de Atención al Cliente",
          description: t("services.chatbotsDesc"),
          url: `${SITE_URL}/`,
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "España" },
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <MethodSection />
        <BenefitsSection />
        <ServicesSection />
        <FAQSection hidePhoneAgents />
        {/* Press coverage and the tooling logos are a pair (the marquee's
            `tight` spacing belongs to the press section above it). They sit
            here as final reinforcement right before the closing CTA. */}
        <PressSection />
        <LogoMarquee />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
