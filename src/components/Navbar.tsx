import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, MessageSquare, Phone, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.method'), href: "/#metodo" },
    { label: t('nav.services'), href: "/#servicios" },
    { label: t('nav.faq'), href: "/#faq" },
    { label: t('nav.contact'), href: "/contacto" },
  ];

  const menuItems = [
    {
      category: t('nav.services'),
      items: [
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
      ],
    },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

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

            {/* Language Toggle + Menu Button */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageToggle />
              <Button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-card hover:bg-secondary text-foreground font-medium px-4 h-10 rounded-full border border-border shadow-sm"
              >
                {t('nav.menu')}
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Mobile: Language Toggle + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageToggle />
              <button
                className="p-2 text-foreground"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border"
            >
              <div className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                  const isExternal = link.href.startsWith("/#");
                  const isHome = link.href === "/";
                  if (isHome) {
                    return (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                        onClick={() => {
                          setIsOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
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
                        className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="border-t border-border my-2 pt-2">
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">{t('nav.services')}</p>
                  <Link
                    to="/chatbots-multicanal"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    {t('service.chatbots')}
                  </Link>
                  <Link
                    to="/agentes-telefonicos"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    {t('service.agents')}
                  </Link>
                </div>
                <Link to="/contacto" onClick={() => setIsOpen(false)}>
                  <Button className="mt-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    {t('cta.contact')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Full Page Menu Dropdown - MarketLabs Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Content - Full Screen Overlay */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-0 top-0 z-50 bg-background"
            >
              {/* Header with close button */}
              <div className="border-b border-border/50">
                <div className="container mx-auto">
                  <div className="flex items-center justify-between h-16 lg:h-20">
                    <Link 
                      to="/" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="flex items-center gap-0.5 text-xl font-bold"
                    >
                      <span className="text-foreground">Simplia</span>
                      <span className="text-primary">Spain</span>
                      <span className="text-primary text-xs align-super">®</span>
                    </Link>
                    <Button 
                      onClick={() => setIsMenuOpen(false)}
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Menu Content */}
              <div className="container py-12 lg:py-16">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
                  {/* Main Navigation - Services */}
                  <div className="lg:col-span-7">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                      {t('nav.ourServices')}
                    </p>
                    <div className="space-y-3">
                      {menuItems[0].items.map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Link
                            to={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="group flex items-center gap-6 p-5 rounded-2xl hover:bg-secondary/50 transition-all duration-300"
                          >
                            <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <item.icon className={`w-7 h-7 ${item.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="text-xl lg:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                                  {item.title}
                                </h4>
                                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                              </div>
                              <p className="text-muted-foreground mt-1">{item.description}</p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Links & CTA */}
                  <div className="lg:col-span-5">
                    <div className="grid gap-8">
                      {/* Quick Links */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          {t('nav.navigation')}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {navLinks.map((link, index) => {
                            const isExternal = link.href.startsWith("/#");
                            if (isExternal) {
                              return (
                                <motion.a
                                  key={link.label}
                                  href={link.href}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 rounded-xl transition-all font-medium"
                                >
                                  {link.label}
                                </motion.a>
                              );
                            }
                            return (
                              <motion.div
                                key={link.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                              >
                                <Link
                                  to={link.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="block px-4 py-3 text-foreground hover:text-primary hover:bg-secondary/50 rounded-xl transition-all font-medium"
                                >
                                  {link.label}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* CTA Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6"
                      >
                        <h4 className="text-lg font-bold text-foreground mb-2">{t('nav.readyToStart')}</h4>
                        <p className="text-sm text-muted-foreground mb-5">
                          {t('nav.strategyCall')}
                        </p>
                        <Link to="/contacto" onClick={() => setIsMenuOpen(false)}>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                            {t('cta.contact')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}