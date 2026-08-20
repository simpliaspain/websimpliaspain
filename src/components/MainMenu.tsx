import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggle";
import ClientAccessButton from "@/components/ClientAccessButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

export type MainMenuLink = { label: string; href: string };
export type MainMenuService = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
};

export const MENU_ID = "main-menu";
export const MENU_TRIGGER_ID = "main-menu-trigger";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_GRACE = 250;

/**
 * Visible + focusable. Deliberately not `getClientRects().length`: focus is
 * moved one frame after the panel mounts, while the enter transition is still
 * running, so the test must not depend on paint state.
 */
function getFocusableItems(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") return false;
    if (el.closest("[hidden]") || el.closest('[inert]')) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

/* ────────────────────────────── mode ────────────────────────────── */

export type MenuMode = "dropdown" | "modal";

const DROPDOWN_QUERY = "(hover: hover) and (pointer: fine)";
const LG_QUERY = "(min-width: 1024px)";

export function useMenuMode(): MenuMode {
  const read = () =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(DROPDOWN_QUERY).matches && window.matchMedia(LG_QUERY).matches;

  const [isDropdown, setIsDropdown] = useState(read);

  useEffect(() => {
    const pointer = window.matchMedia(DROPDOWN_QUERY);
    const large = window.matchMedia(LG_QUERY);
    const sync = () => setIsDropdown(pointer.matches && large.matches);
    sync();
    // Hybrid laptops flip pointer capability at runtime.
    pointer.addEventListener("change", sync);
    large.addEventListener("change", sync);
    return () => {
      pointer.removeEventListener("change", sync);
      large.removeEventListener("change", sync);
    };
  }, []);

  return isDropdown ? "dropdown" : "modal";
}

/* ─────────────────────────── controller ─────────────────────────── */

export type MainMenuController = ReturnType<typeof useMainMenuController>;

export function useMainMenuController() {
  const mode = useMenuMode();
  const [isOpen, setIsOpen] = useState(false);
  const [focusFirstItem, setFocusFirstItem] = useState(false);
  const openedBy = useRef<"hover" | "click" | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearOpenTimer = useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);
  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Never leak a pending timer.
  useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [clearOpenTimer, clearCloseTimer],
  );

  const close = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    openedBy.current = null;
    setFocusFirstItem(false);
    setIsOpen(false);
  }, [clearOpenTimer, clearCloseTimer]);

  const open = useCallback(
    (how: "hover" | "click", element?: HTMLElement | null) => {
      clearOpenTimer();
      clearCloseTimer();
      if (element) triggerRef.current = element;
      openedBy.current = how;
      setIsOpen(true);
    },
    [clearOpenTimer, clearCloseTimer],
  );

  const closeAndRestoreFocus = useCallback(() => {
    const trigger = triggerRef.current;
    close();
    trigger?.focus();
  }, [close]);

  // A mode flip must not strand the side effects of the other mode.
  useEffect(() => {
    close();
  }, [mode, close]);

  const hoverTriggerProps = {
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      if (mode !== "dropdown" || event.pointerType === "touch") return;
      const element = event.currentTarget;
      clearCloseTimer();
      if (isOpen) return;
      clearOpenTimer();
      openTimer.current = window.setTimeout(() => open("hover", element), HOVER_OPEN_DELAY);
    },
    onPointerLeave: () => {
      if (mode !== "dropdown") return;
      clearOpenTimer();
      if (!isOpen || openedBy.current === "click") return;
      clearCloseTimer();
      closeTimer.current = window.setTimeout(close, HOVER_CLOSE_GRACE);
    },
  };

  const commonTriggerProps = {
    "aria-expanded": isOpen,
    "aria-controls": MENU_ID,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (isOpen) {
        close();
        return;
      }
      open("click", event.currentTarget);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowDown" && mode === "dropdown") {
        event.preventDefault();
        setFocusFirstItem(true);
        if (!isOpen) open("click", event.currentTarget);
        return;
      }
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        close();
      }
    },
  };

  const panelHoverProps = {
    onPointerEnter: () => {
      if (mode !== "dropdown") return;
      clearCloseTimer();
    },
    onPointerLeave: () => {
      if (mode !== "dropdown" || openedBy.current === "click") return;
      clearCloseTimer();
      closeTimer.current = window.setTimeout(close, HOVER_CLOSE_GRACE);
    },
  };

  return {
    mode,
    isOpen,
    focusFirstItem,
    triggerRef,
    close,
    closeAndRestoreFocus,
    panelHoverProps,
    /** Desktop trigger: hover intent + click/keyboard. */
    triggerProps: { ...commonTriggerProps, ...hoverTriggerProps, id: MENU_TRIGGER_ID },
    /** Coarse-pointer trigger: tap only. */
    mobileTriggerProps: { ...commonTriggerProps, id: `${MENU_TRIGGER_ID}-mobile` },
  };
}

/* ──────────────────────── shared panel content ──────────────────────── */

interface ContentProps {
  navLinks: MainMenuLink[];
  services: MainMenuService[];
  onClose: () => void;
  bodyClassName?: string;
}

function MainMenuContent({ navLinks, services, onClose, bodyClassName }: ContentProps) {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

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

  return (
    <>
      <div className={cn("mx-auto max-w-6xl px-6", bodyClassName)}>
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
              <h3 className="mb-2 text-lg font-bold text-foreground">{t("nav.readyToStart")}</h3>
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
              <ClientAccessButton
                variant="secondary"
                source="menu"
                className="h-12 w-full text-base"
                onNavigate={onClose}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-2 border-t border-border pb-[env(safe-area-inset-bottom)]">
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
    </>
  );
}

/* ─────────────────────── mode A: hover dropdown ─────────────────────── */

interface ModeProps {
  controller: MainMenuController;
  navLinks: MainMenuLink[];
  services: MainMenuService[];
}

function DropdownMenu({ controller, navLinks, services }: ModeProps) {
  const { isOpen, close, closeAndRestoreFocus, panelHoverProps, triggerRef, focusFirstItem } =
    controller;
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Non-modal: no focus trap, no inert, no scroll lock. Only an outside click closes it.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen, close, triggerRef]);

  // ArrowDown from the trigger lands on the first item.
  useEffect(() => {
    if (!isOpen || !focusFirstItem) return;
    const frame = requestAnimationFrame(() => {
      getFocusableItems(panelRef.current)[0]?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, focusFirstItem]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeAndRestoreFocus();
      return;
    }
    if (event.key !== "Tab") return;
    // Tabbing off either end closes and lets focus continue naturally.
    const items = getFocusableItems(panelRef.current);
    if (items.length === 0) return;
    const atLast = document.activeElement === items[items.length - 1];
    const atFirst = document.activeElement === items[0];
    if ((!event.shiftKey && atLast) || (event.shiftKey && atFirst)) close();
  };

  const panelMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.12 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" as const } },
        exit: { opacity: 0, y: -8, transition: { duration: 0.12, ease: "easeIn" as const } },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...panelMotion}
          ref={panelRef}
          onKeyDown={handleKeyDown}
          id={MENU_ID}
          role="group"
          aria-labelledby={MENU_TRIGGER_ID}
          // The wrapper is full-bleed but inert to the pointer, so the empty
          // margins beside the card neither swallow hero clicks nor read as
          // "still inside the panel" when the cursor leaves.
          className="pointer-events-none fixed inset-x-0 top-20 z-[60]"
        >
          <div className="container mx-auto">
            <div className="relative" {...panelHoverProps}>
              {/* Bridges the 20px between the trigger's bottom edge and the
                  header's, so a diagonal cursor path never leaves the menu. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -top-5 h-5"
                style={{ pointerEvents: isOpen ? "auto" : "none" }}
              />
              <div
                className="overflow-hidden rounded-b-2xl border border-t-0 border-border bg-background shadow-xl"
                style={{ pointerEvents: isOpen ? "auto" : "none" }}
              >
                <MainMenuContent
                  navLinks={navLinks}
                  services={services}
                  onClose={close}
                  bodyClassName="py-8"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────── mode B: full-screen modal ──────────────────── */

function ModalMenu({ controller, navLinks, services }: ModeProps) {
  const { isOpen, close, triggerRef } = controller;
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

  // Declared before the focus effect so its cleanup runs first, un-inerting the
  // trigger before focus returns to it.
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
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const items = getFocusableItems(panelRef.current);
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
    [close],
  );

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

  // The portal must wrap AnimatePresence, not the other way round: a portal is
  // not a valid React element, so AnimatePresence drops it and nothing renders.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...panelMotion}
          ref={panelRef}
          onKeyDown={handleKeyDown}
          id={MENU_ID}
          role="dialog"
          aria-modal="true"
          aria-labelledby="main-menu-title"
          className="fixed inset-0 z-[70] h-[100dvh] overflow-y-auto overscroll-contain bg-background"
        >
          <h2 id="main-menu-title" className="sr-only">
            {t("nav.mainMenu")}
          </h2>

          <div className="border-b border-border/50">
            <div className="container mx-auto">
              <div className="flex h-16 items-center justify-between lg:h-20">
                <Link
                  to="/"
                  onClick={() => {
                    close();
                    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
                  }}
                  className={`flex items-center gap-0.5 rounded-xl text-xl font-bold ${focusRing}`}
                >
                  <span className="text-foreground">Simplia</span>
                  <span className="text-primary">Spain</span>
                  <span className="align-super text-xs text-primary">®</span>
                </Link>
                <Button
                  ref={closeButtonRef}
                  onClick={close}
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

          <MainMenuContent
            navLinks={navLinks}
            services={services}
            onClose={close}
            bodyClassName="py-10 lg:py-14"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ───────────────────────────── entry point ───────────────────────────── */

export function MainMenu({ controller, navLinks, services }: ModeProps) {
  if (controller.mode === "dropdown") {
    return <DropdownMenu controller={controller} navLinks={navLinks} services={services} />;
  }
  return <ModalMenu controller={controller} navLinks={navLinks} services={services} />;
}
