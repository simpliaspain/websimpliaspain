import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
  const { t } = useLanguage();
  const [paused, setPaused] = useState(false);

  return (
    <section id="partners" className="py-16 bg-background overflow-hidden">
      <div className="container mb-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          {t('partners.title')}
        </p>
      </div>

      {/* Under reduced motion the row stops scrolling, so it becomes a plain
          horizontally scrollable list instead - every logo stays reachable. */}
      <div className="marquee-viewport relative motion-reduce:overflow-x-auto">
        {/* Fade edges. They exist to sell the illusion of an endless scroll, so
            they only obscure the ends once the strip is static. */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 motion-reduce:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 motion-reduce:hidden" />

        {/* Keyboard pause control. Hidden until focused so it does not intrude
            on the strip, and it lives inside .marquee-viewport so focusing it
            also pauses via :focus-within. */}
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-1 focus:z-20 focus:rounded-full focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {paused ? t('partners.resume') : t('partners.pause')}
        </button>

        <div
          className="flex gap-8 items-center animate-marquee will-change-transform"
          style={{ width: 'max-content', animationPlayState: paused ? 'paused' : undefined }}
        >
          {[...partners, ...partners].map((partner, index) => {
            // The second pass exists only to make the loop seamless. It is
            // hidden from assistive tech so each brand is announced once, and
            // dropped entirely when the animation is off.
            const isClone = index >= partners.length;
            return (
              <div
                key={index}
                aria-hidden={isClone || undefined}
                className={cn(
                  "flex items-center justify-center flex-shrink-0 h-12 px-6 grayscale brightness-0 opacity-60 transition-all duration-300 hover:grayscale-0 hover:brightness-100 hover:opacity-100 dark:invert dark:hover:invert-0",
                  isClone && "motion-reduce:hidden",
                )}
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-6 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                    {partner.textLogo || partner.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
