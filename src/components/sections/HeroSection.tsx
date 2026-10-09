import { motion } from "framer-motion";
import { Play } from "lucide-react";
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
import { scrollToElement } from "@/lib/scroll";

const heroLogos = [
  { name: "OpenAI", logo: openaiLogo },
  { name: "Meta", logo: metaLogo },
  { name: "Microsoft", logo: microsoftLogo },
  { name: "Google", logo: googleLogo },
];

// Both hero actions: plain text links at one weight. Affordance is the 2px
// brand-blue underline (darkening on hover); py-2.5 gives the 44px hit area
// without visible bulk, and the focus ring draws around that padded box.
// Label foreground on the hero gradient; underline, glyph and dot are graphics.
const heroActionClass =
  "inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

export function HeroSection() {
  const { t } = useLanguage();

  const scrollToPartners = () => {
    const partnersSection = document.getElementById('partners');
    if (partnersSection) scrollToElement(partnersSection);
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

          {/* The two hero actions as one quiet line under the headline, at
              matching weight - the way "Con tecnologia de" used to sit: no
              box, no shadow, no photograph. Both share heroActionClass; the
              play glyph and the green availability dot are the only
              differences. From sm they sit side by side, centred on the
              hero's axis, 32px apart (56px between the labels once each
              link's 12px side padding is added; 24 also read as a pair, only tighter; 40+ as
              two unrelated things); below sm they stack with the booking
              link first, under the thumb. DOM order is watch first, matching
              the desktop reading and keyboard order. The bottom margin below
              sm keeps the block clear of the floating chat widget (lower-right
              84px of the viewport). */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mb-24 flex w-full max-w-sm flex-col-reverse items-center gap-1 sm:mb-0 sm:max-w-2xl sm:flex-row sm:justify-center sm:gap-8"
          >
            {/* Watch the demo: in-page jump that centres the autoplaying video
                below the header (the site's one jump helper; instant under
                reduced motion). */}
            <a
              href="#servicios"
              onClick={(event) => {
                const target = document.querySelector<HTMLElement>("#servicios figure") ?? document.getElementById("servicios");
                if (!target) return;
                event.preventDefault();
                scrollToElement(target, "center");
              }}
              className={heroActionClass}
            >
              <Play className="h-4 w-4 shrink-0 fill-primary text-primary" aria-hidden="true" />
              {t('hero.seeInAction')}
            </a>

            {/* Strategy call - opens the 15-minute booking page (Cal.com). The
                dot carries "available"; screen readers get the word and the
                new-tab notice instead. */}
            <a
              href="https://reservas.simpliaspain.com/simpliaspain/llamadaestrategia"
              target="_blank"
              rel="noopener noreferrer"
              className={heroActionClass}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
              <span className="sr-only">{t('hero.available')}: </span>
              {t('hero.strategyCall')}
              <span className="sr-only"> {t('nav.opensNewTab')}</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </Section>
  );
}
