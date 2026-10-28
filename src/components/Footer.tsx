import { Bot, Phone, Mail, Linkedin, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { EMAIL, PHONE_ALT, PHONE_MAIN, SOCIAL_LINKS, demoUrl } from "@/lib/site";

/** lucide has no TikTok glyph; same 24px box and stroke-free fill. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

const SOCIAL_ICONS = { linkedin: Linkedin, instagram: Instagram, tiktok: TikTokIcon, youtube: Youtube } as const;

export function Footer() {
  const { t } = useLanguage();

  const openChatbot = () => {
    // Dispatch custom event to open chatbot widget
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  const linkClass = "hover:text-foreground transition-colors";

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-0.5 text-xl font-bold">
              <span className="text-foreground">Simplia</span>
              <span className="text-primary">Spain</span>
              <span className="ml-0.5 align-super text-xs text-primary">®</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
            <p className="mt-2 text-sm font-medium text-foreground">{t('footer.tagline')}</p>
            <button
              onClick={openChatbot}
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary/10 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Bot aria-hidden="true" className="h-5 w-5" />
              {t('footer.chatWithBot')}
            </button>
          </div>

          {/* Product */}
          <div>
            <h2 className="mb-4 font-semibold text-foreground">{t('footer.product')}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/chatbots-multicanal" className={linkClass}>{t('footer.whatsappAgent')}</Link></li>
              <li><Link to="/como-trabajamos" className={linkClass}>{t('footer.howWeWork')}</Link></li>
              <li><Link to="/agentes-telefonicos" className={linkClass}>{t('footer.phoneAgent')}</Link></li>
              <li>
                <a
                  href={demoUrl("web")}
                  target="_blank"
                  rel="noopener"
                  className={linkClass}
                  data-umami-event="demo"
                  data-umami-event-lugar="pie"
                >
                  {t('footer.tryFree')}
                  <span className="sr-only"> {t('nav.opensNewTab')}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h2 className="mb-4 font-semibold text-foreground">{t('footer.follow')}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {SOCIAL_LINKS.map((s) => {
                const Icon = SOCIAL_ICONS[s.key];
                return (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={`${t('footer.followOn')} ${s.label} ${t('nav.opensNewTab')}`}
                      className={`inline-flex items-center gap-2 ${linkClass}`}
                      data-umami-event="red"
                      data-umami-event-red={s.key}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact. Two phones on two levels: the main one large, the
              alternative small underneath it. */}
          <div>
            <h2 className="mb-4 font-semibold text-foreground">{t('footer.contactTitle')}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${EMAIL}`} className={`flex items-center gap-2 ${linkClass}`}>
                  <Mail aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-primary" />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={PHONE_MAIN.href}
                  aria-label={`${t('footer.call')} ${PHONE_MAIN.display}`}
                  className="flex items-center gap-2 text-base font-semibold text-foreground transition-colors hover:text-primary"
                >
                  <Phone aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-primary" />
                  {PHONE_MAIN.display}
                </a>
                <a
                  href={PHONE_ALT.href}
                  aria-label={`${t('footer.call')} ${PHONE_ALT.display}`}
                  className={`ml-6 mt-1 inline-block text-xs ${linkClass}`}
                >
                  {t('footer.altPhone')}: {PHONE_ALT.display}
                </a>
              </li>
              <li>
                <Link to="/politica-privacidad" className={linkClass}>{t('footer.privacyPolicy')}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Simplia Spain. {t('footer.rights')}
          </p>
          <p className="text-sm text-muted-foreground">{t('footer.alwaysOn')}</p>
        </div>
      </div>
    </footer>
  );
}
