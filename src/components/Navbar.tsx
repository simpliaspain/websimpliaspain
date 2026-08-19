import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, MessageSquare, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { MainMenu, type MainMenuService } from "./MainMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import ClientAccessButton from "@/components/ClientAccessButton";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
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
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Phone,
      title: t('service.agents'),
      description: t('service.agentsDesc'),
      href: "/agentes-telefonicos",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Remember which trigger opened the menu so focus can return to it.
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setIsMenuOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-0.5 text-xl font-bold"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span className="text-foreground">Simplia</span>
              <span className="text-primary">Spain</span>
              <span className="text-primary text-xs align-super">®</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
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

            {/* Actions cluster: client access + language + menu */}
            <div className="hidden md:flex items-center gap-3">
              <span aria-hidden="true" className="h-6 w-px bg-border" />
              <ClientAccessButton className="hidden md:inline-flex" />
              <LanguageToggle />
              <Button
                onClick={openMenu}
                aria-expanded={isMenuOpen}
                aria-controls="main-menu"
                className="bg-card hover:bg-secondary text-foreground font-medium px-4 h-10 rounded-full border border-border shadow-sm"
              >
                {t('nav.menu')}
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 motion-reduce:transition-none ${isMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Mobile: Language Toggle + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageToggle />
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={openMenu}
                aria-expanded={isMenuOpen}
                aria-controls="main-menu"
                aria-label={t('nav.menu')}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MainMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navLinks={navLinks}
        services={services}
        triggerRef={triggerRef}
      />
    </>
  );
}
