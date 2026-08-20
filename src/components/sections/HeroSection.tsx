import { motion } from "framer-motion";
import TrustBadge from "@/components/TrustBadge";
import robertoProfile from "@/assets/roberto-profile.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden bg-gradient-hero">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Main Headline - Two lines with different sizes */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center mb-8"
          >
            <span className="text-4xl md:text-4xl lg:text-5xl font-medium text-foreground mb-1">
              {t('hero.wantMore')}
            </span>
            <h1 className="text-7xl md:text-8xl lg:text-[8rem] xl:text-[10rem] font-bold leading-none">
              <span className="text-gradient italic pr-2">{t('hero.clients')}</span>
            </h1>
          </motion.div>

          {/* Subheadline - increased x1.5 */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mb-12"
          >
            {t('hero.subtitle1')} <span className="font-semibold text-foreground">{t('hero.subtitle2')}</span>
            <br />{t('hero.subtitle3')} <span className="font-semibold text-foreground">{t('hero.subtitle4')}</span>
          </motion.p>

          {/* Trust badges. The bottom margin below sm keeps the pair clear of the
              floating chat widget, which occupies the lower-right 84px of the
              viewport (bottom-5 offset + h-16 button). */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mb-24 grid w-full max-w-sm auto-rows-fr grid-cols-1 gap-4 sm:mb-0 sm:max-w-2xl sm:grid-cols-2 sm:gap-6"
          >
            {/* Social proof - scrolls to the partners marquee */}
            <TrustBadge asChild>
              <button type="button" onClick={scrollToPartners}>
                <span className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 fill-current text-yellow-400"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </span>
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-primary motion-reduce:transition-none">
                    {t('hero.collaborating')}
                  </span>
                </span>
              </button>
            </TrustBadge>

            {/* Strategy call - opens Calendly */}
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
          </motion.div>
        </div>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
