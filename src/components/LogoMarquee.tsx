import { motion } from "framer-motion";

// Import SVG logos
import zapierLogo from "@/assets/logos/zapier.svg";
import notionLogo from "@/assets/logos/notion.svg";
import airtableLogo from "@/assets/logos/airtable.svg";
import googleCloudLogo from "@/assets/logos/googlecloud.svg";
import openaiLogo from "@/assets/logos/openai.svg";
import shopifyLogo from "@/assets/logos/shopify.svg";
import wordpressLogo from "@/assets/logos/wordpress.svg";
import supabaseLogo from "@/assets/logos/supabase.svg";
import metaLogo from "@/assets/logos/meta.svg";
import slackLogo from "@/assets/logos/slack.svg";
import telegramLogo from "@/assets/logos/telegram.svg";
import framerLogo from "@/assets/logos/framer.svg";
import microsoftLogo from "@/assets/logos/microsoft.svg";
import googleLogo from "@/assets/logos/google.svg";
import brevoLogo from "@/assets/logos/brevo.svg";
import n8nLogo from "@/assets/logos/n8n.svg";
import makeLogo from "@/assets/logos/make.svg";
import anthropicLogo from "@/assets/logos/anthropic.svg";
import hostingerLogo from "@/assets/logos/hostinger.svg";
import perplexityLogo from "@/assets/logos/perplexity.svg";
import apolloLogo from "@/assets/logos/apollo.svg";

interface Partner {
  name: string;
  logo: string | null;
  textLogo?: string;
}

const partners: Partner[] = [
  { name: "N8N", logo: n8nLogo },
  { name: "Make", logo: makeLogo },
  { name: "Zapier", logo: zapierLogo },
  { name: "Notion", logo: notionLogo },
  { name: "Apollo", logo: apolloLogo },
  { name: "Airtable", logo: airtableLogo },
  { name: "Brevo", logo: brevoLogo },
  { name: "Google Cloud", logo: googleCloudLogo },
  { name: "ChatGPT", logo: openaiLogo },
  { name: "Gemini", logo: googleLogo },
  { name: "Claude", logo: anthropicLogo },
  { name: "Perplexity", logo: perplexityLogo },
  { name: "Hostinger", logo: hostingerLogo },
  { name: "Shopify", logo: shopifyLogo },
  { name: "WordPress", logo: wordpressLogo },
  { name: "Supabase", logo: supabaseLogo },
  { name: "Microsoft 365", logo: microsoftLogo },
  { name: "Meta", logo: metaLogo },
  { name: "Slack", logo: slackLogo },
  { name: "Telegram", logo: telegramLogo },
  { name: "Framer", logo: framerLogo },
];

export function LogoMarquee() {
  return (
    <section id="partners" className="py-16 bg-background overflow-hidden">
      <div className="container mb-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Colaborando con las mejores empresas
        </p>
      </div>
      
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div 
          className="flex gap-8 items-center animate-marquee will-change-transform"
          style={{ width: 'max-content' }}
        >
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center flex-shrink-0 h-12 px-6 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
            >
              {partner.logo ? (
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="h-6 w-auto object-contain"
                  title={partner.name}
                />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                  {partner.textLogo || partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
