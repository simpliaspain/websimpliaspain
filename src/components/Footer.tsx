import { Bot, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const openChatbot = () => {
    // Dispatch custom event to open chatbot widget
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-0.5 text-xl font-bold mb-4">
              <span className="text-foreground">Simplia</span>
              <span className="text-primary">Spain</span>
              <span className="text-primary text-xs align-super ml-0.5">®</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t('footer.description')}
            </p>
            
            {/* Service icons: Chatbot, Phone 1, Phone 2 */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-3 mt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={openChatbot}
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      aria-label="Abrir chatbot"
                    >
                      <Bot className="w-5 h-5 text-primary" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('footer.chatWithBot')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href="tel:+34601755607" 
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      aria-label="Llamar al +34 601 755 607"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>+34 601 755 607</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a 
                      href="tel:+34608445993" 
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      aria-label="Llamar al +34 608 445 993"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>+34 608 445 993</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/chatbots-multicanal" className="hover:text-foreground transition-colors">{t('footer.chatbotsWhatsapp')}</Link></li>
              <li><Link to="/chatbots-multicanal" className="hover:text-foreground transition-colors">{t('footer.chatbotsTelegram')}</Link></li>
              <li><Link to="/chatbots-multicanal" className="hover:text-foreground transition-colors">{t('footer.chatbotsWeb')}</Link></li>
              <li><Link to="/agentes-telefonicos" className="hover:text-foreground transition-colors">{t('footer.phoneAgents')}</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.resources')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contacto" className="hover:text-foreground transition-colors">{t('footer.requestDemo')}</Link></li>
              <li><Link to="/#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/politica-privacidad" className="hover:text-foreground transition-colors">{t('footer.privacyPolicy')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.contactTitle')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a 
                  href="mailto:info@simpliaspain.com" 
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  info@simpliaspain.com
                </a>
              </li>
              <li>
                <a 
                  href="tel:+34608445993" 
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  +34 608 445 993
                </a>
              </li>
              <li>
                <a 
                  href="tel:+34601755607" 
                  className="hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  +34 601 755 607
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Simplia Spain. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{t('footer.hereToHelp')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}