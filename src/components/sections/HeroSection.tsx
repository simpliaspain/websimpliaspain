import { motion } from "framer-motion";
import TrustBadge from "@/components/TrustBadge";
import robertoProfile from "@/assets/roberto-profile-2026.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

// Reused from the marquee below - no new assets. These four are the most
// recognisable to a non-technical Spanish SME buyer.
import openaiLogo from "@/assets/logos/openai.svg";
import metaLogo from "@/assets/logos/meta.svg";
import microsoftLogo from "@/assets/logos/microsoft.svg";
import googleLogo from "@/assets/logos/google.svg";
import { Section } from "@/components/Section";

const heroLogos = [
  { name: "OpenAI", logo: openaiLogo },
  { name: "Meta", logo: metaLogo },
  { name: "Microsoft", logo: microsoftLogo },
  { name: "Google", logo: googleLogo },
];

export function HeroSection() {
  const { t } = useLanguage();

  const scrollToPartners = () => {
    const partnersSection = document.getElementById('partners');
    if (partnersSection) {
      const navbarHeight = 80;
      const elementPosition = partnersSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - navbarHeight, behavior: 'smooth' });
    }
  };

  return (
    <Section variant="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-hero">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* No entrance fade on the hero: the page is prerendered, so with
              initial opacity 0 the headline (the LCP element) stayed invisible
              until the bundle hydrated - LCP 3.8 s instead of 1.2 s on a
              throttled mobile. initial={false} renders the final state at once.
              Sections further down keep their scroll-in animations. */}
          {/* Display headline - the biggest thing on screen, but not the h1:
              on its own it is a single word ("Clientes?"), which is what
              crawlers were reading as the page heading. The h1 is the subtitle
              below, which actually describes the page. Visuals unchanged. */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-8"
          >
            <span className="text-4xl md:text-4xl lg:text-5xl font-medium text-foreground mb-1">
              {t('hero.wantMore')}
            </span>
            <div className="text-7xl md:text-8xl lg:text-[8rem] xl:text-[10rem] font-bold leading-none">
              <span className="text-gradient italic pr-2">{t('hero.clients')}</span>
            </div>
          </motion.div>

          {/* Subheadline, and the page's h1 (see above). Tailwind's preflight
              resets heading size/weight/margin, so the same utility classes
              render it exactly as the <p> did. */}
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground mx-auto max-w-3xl mb-12 text-pretty"
          >
            {/* The break falls on the conjunction, splitting the two ideas
                rather than equalising line lengths. Only from sm up: below that
                it is display:none and the {' '} carries the spacing, so mobile
                keeps plain greedy wrapping. */}
            {t('hero.subtitle1')} <span className="font-semibold text-foreground">{t('hero.subtitle2')}</span>{' '}
            <br className="hidden sm:inline" />
            {t('hero.subtitle3')} <span className="font-semibold text-foreground">{t('hero.subtitle4')}</span>
          </motion.h1>

          {/* The conversion CTA and the supporting technology line. They are no
              longer a matched pair, so no equal-height grid: the CTA keeps the
              TrustBadge shell and the technology line is plain inline content.
              DOM order is CTA first, which is the mobile order - the action
              before the evidence. The bottom margin below sm keeps the block
              clear of the floating chat widget, which occupies the lower-right
              84px of the viewport (bottom-5 offset + h-16 button). */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mb-24 flex w-full max-w-sm flex-col items-center gap-4 sm:mb-0 sm:max-w-2xl sm:flex-row sm:justify-center sm:gap-6"
          >
            {/* Strategy call - opens Calendly. Unchanged. */}
            <TrustBadge asChild>
              <a
                href="https://calendly.com/simpliaspain/30min"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={robertoProfile}
                  alt="Roberto"
                  className="h-10 w-10 shrink-0 rounded-full border-2 border-primary/20 object-cover"
                />
                <span className="flex flex-col items-start text-left">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-green-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {t('hero.available')}
                  </span>
                  <span className="text-sm font-semibold">{t('hero.strategyCall')}</span>
                </span>
              </a>
            </TrustBadge>

            {/* Technology line - a caption, not a card. No shell, sits straight
                on the hero gradient. py-3 buys the 44px hit area without adding
                visible bulk. */}
            <button
              type="button"
              onClick={scrollToPartners}
              aria-label={t('hero.poweredByAria')}
              className="group flex shrink-0 items-center justify-center gap-3 rounded-xl px-2 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:order-first"
            >
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t('hero.poweredBy')}
              </span>
              <span className="flex items-center gap-3">
                {/* All four fit at 320px: measured 243px (es) / 208px (en)
                    inside 272px of available width, no wrap, no overflow. */}
                {heroLogos.map((item) => (
                  <img
                    key={item.name}
                    src={item.logo}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-auto object-contain grayscale brightness-0 opacity-60 transition-opacity duration-300 group-hover:opacity-90 dark:invert motion-reduce:transition-none"
                  />
                ))}
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </Section>
  );
}
