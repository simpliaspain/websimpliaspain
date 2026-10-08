import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { scrollToElement } from "@/lib/scroll";

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
import { Section } from "@/components/Section";

interface Partner {
  name: string;
  logo: string | null;
  textLogo?: string;
  /** Rendered width in px at the fixed 24px height (the mark's own ratio). */
  width?: number;
}

// Explicit px, not rem or intrinsic SVG size: the strip must render the same
// whatever the browser's default font size, and the SVGs do not all declare
// a size (most are a bare 24x24 viewBox, Apollo carries 2500x901).
const LOGO_HEIGHT = 24;

const partners: Partner[] = [
  { name: "N8N", logo: n8nLogo },
  { name: "Make", logo: makeLogo },
  { name: "Zapier", logo: zapierLogo },
  { name: "Notion", logo: notionLogo },
  { name: "Apollo", logo: apolloLogo, width: 67 },
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
    <Section variant="tight" id="partners" className="bg-background overflow-hidden">
      {/* 20px + the tile's 12px above its 24px mark = 32px from caption to
          logos, the same caption-to-row distance as the press section. */}
      <div className="container mb-[20px]">
        <p className="text-center text-sm font-medium text-muted-foreground">
          {t('partners.title')}
        </p>
      </div>

      {/* The viewport clips its own track rather than relying on the Section.
          Under reduced motion the row stops moving and wraps into centred
          rows instead - every logo stays visible, and nothing scrolls (an
          overflow-x:auto strip drew a draggable scrollbar under the row on
          machines with classic scrollbars). */}
      <div className="marquee-viewport relative overflow-hidden motion-reduce:px-4">
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
          className="flex w-max items-center gap-8 animate-marquee will-change-transform motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-0 motion-reduce:gap-y-2"
          style={{ animationPlayState: paused ? 'paused' : undefined }}
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
                  "flex items-center justify-center flex-shrink-0 h-[48px] px-[24px] motion-reduce:px-[16px] grayscale brightness-0 opacity-60 transition-all duration-300 hover:grayscale-0 hover:brightness-100 hover:opacity-100 dark:invert dark:hover:invert-0",
                  isClone && "motion-reduce:hidden",
                )}
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.width ?? LOGO_HEIGHT}
                    height={LOGO_HEIGHT}
                    style={{ width: partner.width ?? LOGO_HEIGHT, height: LOGO_HEIGHT }}
                    className="object-contain"
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

      {/* The caption above labels the logos; this is a separate action
          below them: from the tools to what is built with them. A real
          in-page link (works without JS), styled with the caption's
          restraint. It centres the demo video below the header via the
          site's one jump helper (instant under reduced motion). Text is
          foreground on background; the arrow (primary) is a graphic. */}
      <div className="container mt-6 flex justify-center">
        <a
          href="#servicios"
          onClick={(event) => {
            const target = document.querySelector<HTMLElement>("#servicios figure") ?? document.getElementById("servicios");
            if (!target) return;
            event.preventDefault();
            scrollToElement(target, "center");
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          {t('partners.seeInAction')}
          <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        </a>
      </div>
    </Section>
  );
}
