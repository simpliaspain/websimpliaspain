import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { EMAIL, PHONE_MAIN, demoUrl } from "@/lib/site";
import { MENU_ID, type MainMenuController } from "@/hooks/use-main-menu";

export type MainMenuLink = { label: string; href: string };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Visible + focusable. Deliberately not `getClientRects().length`: focus is
 * moved one frame after the panel mounts, while the enter transition is still
 * running, so the test must not depend on paint state.
 */
function getFocusableItems(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    if (el.hasAttribute("disabled") || el.getAttribute("aria-hidden") === "true") return false;
    if (el.closest("[hidden]") || el.closest("[inert]")) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

/**
 * The whole menu: one full-screen panel, at every width.
 *
 * Four links set at display size on hairline rules, and a quiet row at the
 * foot for everything that is not navigation - client access, contact,
 * the phone, the email and the language. The panel keeps the header's own
 * logo and trigger visible above it, so closing it is where opening it was.
 *
 * It is a portal wrapped in AnimatePresence, never the other way round: a
 * portal is not a valid React element, so AnimatePresence would drop it and
 * the menu would "open" with nothing rendered. tests/menu-modes.spec.ts
 * guards that, and the inert root and the shared scroll lock with it.
 */
export function MainMenu({
  controller,
  navLinks,
}: {
  controller: MainMenuController;
  navLinks: MainMenuLink[];
}) {
  const { isOpen, close, triggerRef } = controller;
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return unlockBodyScroll;
  }, [isOpen]);

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

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const frame = requestAnimationFrame(() => {
      getFocusableItems(panelRef.current)[0]?.focus();
    });
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
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.18, ease: "easeOut" as const },
      };

  const bigLink =
    "flex min-h-[clamp(64px,10vh,96px)] items-center border-b border-border text-[clamp(30px,4.6vw,52px)] font-extrabold leading-none tracking-[-0.035em] text-foreground transition-colors hover:text-link motion-reduce:transition-none";
  const smallLink =
    "flex min-h-[44px] items-center text-[17px] font-semibold text-foreground transition-colors hover:text-link motion-reduce:transition-none";

  const goHome = () => {
    close();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  // No document during the build-time prerender, so nothing to portal into.
  if (!mounted) return null;

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
          className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-y-auto overscroll-contain bg-background"
        >
          <h2 id="main-menu-title" className="sr-only">
            {t("nav.mainMenu")}
          </h2>

          {/* The header's own row, repeated inside the panel. The real header
              is underneath the opaque panel, so this is what the reader sees;
              repeating it here keeps the close control inside the focus trap
              instead of stranded behind it. */}
          <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-[10px] sm:px-8 lg:px-12">
            <Link
              to="/"
              onClick={goHome}
              aria-label={t("nav.homeAria")}
              className="flex min-h-[44px] items-center text-[clamp(19px,5vw,22px)] font-extrabold tracking-[-0.02em] text-foreground"
            >
              Simplia<span className="text-brand">Spain</span>
              <span aria-hidden="true" className="mt-[9px] self-start text-[11px] font-semibold text-brand">
                ®
              </span>
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label={t("nav.closeMenu")}
              className="-mr-3 flex h-12 w-12 items-center justify-center rounded-md text-foreground"
            >
              <span aria-hidden="true" className="relative block h-6 w-6">
                <span className="absolute left-0 top-[11px] h-0.5 w-6 rotate-45 rounded-sm bg-current" />
                <span className="absolute left-0 top-[11px] h-0.5 w-6 -rotate-45 rounded-sm bg-current" />
              </span>
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-[clamp(32px,6vh,64px)] px-5 pb-[calc(clamp(32px,6vh,64px)+env(safe-area-inset-bottom))] pt-[clamp(32px,7vh,80px)] sm:px-8 lg:px-12">
            <div className="grid border-t border-border">
              {navLinks.map((link) =>
                link.href === "/" ? (
                  <Link key={link.label} to={link.href} onClick={goHome} className={bigLink}>
                    {link.label}
                  </Link>
                ) : link.href.startsWith("/#") ? (
                  <a key={link.label} href={link.href} onClick={close} className={bigLink}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.label} to={link.href} onClick={close} className={bigLink}>
                    {link.label}
                  </Link>
                ),
              )}
              <a
                href={demoUrl("web")}
                target="_blank"
                rel="noopener"
                onClick={close}
                data-umami-event="demo"
                data-umami-event-lugar="menu"
                className={`${bigLink} text-link`}
              >
                {t("cta.demo")}
                <span className="sr-only"> {t("nav.opensNewTab")}</span>
              </a>
            </div>

            {/* Everything that is not navigation, kept small and at the foot. */}
            <div className="mt-auto flex flex-wrap items-center gap-x-7 gap-y-4">
              <a
                href="https://panel.simpliaspain.com/?ref=menu"
                target="_blank"
                rel="noopener"
                aria-label={`${t("nav.clientAccess")} ${t("nav.opensNewTab")}`}
                onClick={close}
                className={smallLink}
              >
                {t("nav.clientAccess")}
              </a>
              <a href={PHONE_MAIN.href} className={smallLink}>
                {PHONE_MAIN.display}
              </a>
              <a href={`mailto:${EMAIL}`} className={smallLink}>
                {EMAIL}
              </a>
              <Link to="/politica-privacidad" onClick={close} className={`${smallLink} font-medium text-muted-foreground`}>
                {t("footer.privacyPolicy")}
              </Link>
              <div className="[&>button]:min-h-[44px]">
                <LanguageToggle />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
