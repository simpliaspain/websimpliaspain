import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { MethodSection } from "@/components/sections/MethodSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { LogoMarquee } from "@/components/LogoMarquee";
import { Seo } from "@/components/Seo";
import { JsonLd, ORGANIZATION_ID } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo titleKey="seo.home.title" descriptionKey="seo.home.description" path="/" />
      {/* Moved from index.html unchanged, minus an Offer that carried no price. */}
      <JsonLd
        data={{
          "@type": "Service",
          name: "Chatbots y Agentes Telefónicos IA",
          serviceType: "Automatización de Atención al Cliente",
          description:
            "Automatización de atención al cliente con chatbots inteligentes en WhatsApp, Web, Telegram e Instagram, y agentes telefónicos con IA disponibles 24/7",
          url: `${SITE_URL}/`,
          provider: { "@id": ORGANIZATION_ID },
          areaServed: { "@type": "Country", name: "España" },
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <MethodSection />
        <LogoMarquee />
        <BenefitsSection />
        <ServicesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
