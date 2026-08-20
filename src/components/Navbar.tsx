import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, MessageSquare, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { MainMenu, type MainMenuService } from "./MainMenu";
import { useMainMenuController } from "@/hooks/use-main-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import ClientAccessButton from "@/components/ClientAccessButton";

export function Navbar() {
  const menu = useMainMenuController();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.method'), href: "/#metodo" },
    { label: t('nav.services'), href: "/#servicios" },
    { label: t('nav.faq'), href: "/#faq" },
    { label: t('nav.contact'), href: "/contacto" },
  ];

  const services: MainMenuService[] = [
    {
      icon: MessageSquare,
      title: t('service.chatbots'),
      description: t('service.chatbotsDesc'),
      href: "/chatbots-multicanal",
      color: "text-service-chatbots",
      bgColor: "bg-service-chatbots/10",
    },
    {
      icon: Phone,
      title: t('service.agents'),
      description: t('service.agentsDesc'),
      href: "/agentes-telefonicos",
      color: "text-service-agents",
      bgColor: "bg-service-agents/10",
    },
  ];

  // The header floats over the page at the top of the document and only
  // grows a surface once content scrolls under it.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    menu.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 motion-reduce:transition-none",
          isScrolled || menu.isOpen
            ? "bg-background/80 backdrop-blur-md border-border/40"
            : "bg-transparent border-transparent",
        )}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20 xl:grid xl:grid-cols-[1fr_auto_1fr]">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-0.5 text-xl font-bold xl:justify-self-start"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="text-foreground">Simplia</span>
              <span className="text-primary">Spain</span>
              <span className="text-primary text-xs align-super">®</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:justify-self-center">
            {navLinks.map((link) => {
                const isExternal = link.href.startsWith("/#");
                const isHome = link.href === "/";
                if (isHome) {
                  return (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                    >
                      {link.label}
                    </Link>
                  );
                }
                if (isExternal) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Actions cluster: language + client access + menu */}
            <div className="hidden lg:flex items-center gap-3 xl:justify-self-end">
              <LanguageToggle />
              <ClientAccessButton className="hidden lg:inline-flex" />
              <Button
                {...menu.triggerProps}
                className="bg-card hover:bg-secondary text-foreground font-medium px-4 h-10 rounded-full border border-border shadow-sm"
              >
                {t('nav.menu')}
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 motion-reduce:transition-none ${menu.isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Below lg: language + menu button only, menu opens as a modal */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageToggle />
              <button
                {...menu.mobileTriggerProps}
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={t('nav.menu')}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MainMenu controller={menu} navLinks={navLinks} services={services} />
    </>
  );
}
