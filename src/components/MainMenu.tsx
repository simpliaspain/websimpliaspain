import { useCallback, useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggle";
import ClientAccessButton from "@/components/ClientAccessButton";
import { useLanguage } from "@/contexts/LanguageContext";

export type MainMenuLink = { label: string; href: string };
export type MainMenuService = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
};

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: MainMenuLink[];
  services: MainMenuService[];
  /** Element focus returns to on close - whichever trigger opened the menu. */
  triggerRef: RefObject<HTMLElement | null>;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function MainMenu({ isOpen, onClose, navLinks, services, triggerRef }: MainMenuProps) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Lock body scroll, compensating for the scrollbar so the page does not
  // shift horizontally, and restore the scroll position on close.
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      Object.assign(body.style, previous);
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Take the background out of the accessibility tree and out of tab order.
  // Declared before the focus effect so its cleanup runs first, un-inerting
  // the trigger before focus returns to it.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.getElementById("root");
    if (!root) return;
    root.setAttribute("inert", "");
    root.setAttribute("aria-hidden", "true");
    return () => {
      root.removeAttribute("inert");
      root.removeAttribute("aria-hidden");
    };
  }, [isOpen]);

  // Focus the close button on open, return focus to the trigger on close.
  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      trigger?.focus();
    };
  }, [isOpen, triggerRef]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0,
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const goHome = () => {
    onClose();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  const linkClass = `flex min-h-[44px] items-center rounded-xl px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted hover:text-primary motion-reduce:transition-none ${focusRing}`;

  const renderNavLink = (link: MainMenuLink) => {
    if (link.href === "/") {
      return (
        <Link key={link.label} to={link.href} onClick={goHome} className={linkClass}>
          {link.label}
        </Link>
      );
    }
    if (link.href.startsWith("/#")) {
      return (
        <a key={link.label} href={link.href} onClick={onClose} className={linkClass}>
          {link.label}
        </a>
      );
    }
    return (
      <Link key={link.label} to={link.href} onClick={onClose} className={linkClass}>
        {link.label}
      </Link>
    );
  };

  const panelMotion = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };

  return (
    <AnimatePresence>
      {isOpen &&
        createPortal(
          <motion.div
            {...panelMotion}
            ref={panelRef}
            onKeyDown={handleKeyDown}
            id="main-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="main-menu-title"
            className="fixed inset-0 z-[70] h-[100dvh] overflow-y-auto overscroll-contain bg-background"
          >
            <h2 id="main-menu-title" className="sr-only">
              {t("nav.mainMenu")}
            </h2>

            {/* Top bar */}
            <div className="border-b border-border/50">
              <div className="container mx-auto">
                <div className="flex h-16 items-center justify-between lg:h-20">
                  <Link
                    to="/"
                    onClick={goHome}
                    className={`flex items-center gap-0.5 rounded-xl text-xl font-bold ${focusRing}`}
                  >
                    <span className="text-foreground">Simplia</span>
                    <span className="text-primary">Spain</span>
                    <span className="align-super text-xs text-primary">®</span>
                  </Link>
                  <Button
                    ref={closeButtonRef}
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    aria-label={t("nav.closeMenu")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
                {/* Services */}
                <section className="order-2 lg:order-1">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("nav.ourServices")}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {services.map((service) => (
                      <Link
                        key={service.title}
                        to={service.href}
                        onClick={onClose}
                        className={`group flex min-h-[44px] items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-muted motion-reduce:transition-none ${focusRing}`}
                      >
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${service.bgColor}`}
                        >
                          <service.icon className={`h-6 w-6 ${service.color}`} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold text-foreground transition-colors group-hover:text-primary motion-reduce:transition-none">
                            {service.title}
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            {service.description}
                          </span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                        />
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Navigation */}
                <section className="order-1 lg:order-2">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("nav.navigation")}
                  </h3>
                  <div className="flex flex-col gap-1">{navLinks.map(renderNavLink)}</div>
                </section>

                {/* Actions */}
                <section className="order-3 flex flex-col gap-6 md:col-span-2 lg:col-span-1">
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      {t("nav.readyToStart")}
                    </h3>
                    <p className="mb-5 text-sm text-muted-foreground">{t("nav.strategyCall")}</p>
                    <Button asChild className="h-12 w-full font-semibold">
                      <Link to="/contacto" onClick={onClose}>
                        {t("cta.contact")}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      {t("nav.alreadyClient")}
                    </h3>
                    <ClientAccessButton variant="primary" source="menu" onNavigate={onClose} />
                  </div>
                </section>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border pb-[env(safe-area-inset-bottom)]">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
                <div className="[&>button]:min-h-[44px] [&>button]:px-4">
                  <LanguageToggle />
                </div>
                <Link
                  to="/politica-privacidad"
                  onClick={onClose}
                  className={`flex min-h-[44px] items-center rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none ${focusRing}`}
                >
                  {t("footer.privacyPolicy")}
                </Link>
              </div>
            </div>
          </motion.div>,
          document.body,
        )}
    </AnimatePresence>
  );
}
