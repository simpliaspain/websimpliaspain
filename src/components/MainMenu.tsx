import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { EMAIL, PHONE_MAIN, demoUrl } from "@/lib/site";
import { MENU_ID, type MainMenuController } from "@/hooks/use-main-menu";

export type MainMenuLink = { label: string; href: string };

/** How long the panel takes to fade out, in milliseconds. */
const EXIT_MS = 200;

/**
 * Three bars that become a cross. The header and the panel each render one
 * of these at the same place and size - the panel's starts closed and opens
 * on mount - so what the reader sees is one control changing shape, not a
 * hamburger being replaced by an X when the panel paints over it.
 */
export function MenuGlyph({ open }: { open: boolean }) {
  const bar = "absolute left-0 h-0.5 w-6 rounded-sm bg-current transition-transform duration-200 ease-out motion-reduce:transition-none";
  return (
    <span aria-hidden="true" className="relative block h-6 w-6">
      <span className={bar} style={{ top: 11, transform: open ? "rotate(45deg)" : "translateY(-7px)" }} />
      <span
        className="absolute left-0 top-[11px] h-0.5 w-6 rounded-sm bg-current transition-opacity duration-150 ease-out motion-reduce:transition-none"
        style={{ opacity: open ? 0 : 1 }}
      />
      <span className={bar} style={{ top: 11, transform: open ? "rotate(-45deg)" : "translateY(7px)" }} />
    </span>
  );
}

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
 * Opening and closing are a plain CSS transition on two local flags rather
 * than framer-motion, which left a one-frame flash: the panel faded in over
 * 180ms and then, about 60ms after it had settled, dropped to opacity 0 for
 * a single frame before snapping back. Same DOM node throughout, so it was
 * the library writing the final value a frame late, not a remount - and it
 * is exactly the blink you see. `present` controls the mount, `shown` the
 * transition, and `present` is only cleared once the closing transition has
 * actually ended.
 *
 * That ordering matters on the way out too. The scroll lock used to be
 * released the instant `isOpen` went false, so the body came out of
 * `position: fixed` and the page jumped back to its real scroll offset while
 * the white panel was still half-transparent on top of it. The lock is now
 * held until the panel is gone.
 *
 * It is still a portal with the animated element inside it, never the other
 * way round, and it still inerts #root and takes the shared scroll lock.
 * tests/menu-modes.spec.ts guards all three.
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

  // Mount/animation state. `present` keeps the panel in the DOM while it
  // closes; `shown` is what the CSS transition reads.
  const [present, setPresent] = useState(false);
  const [shown, setShown] = useState(false);
  const locked = useRef(false);

  const releaseLock = useCallback(() => {
    if (!locked.current) return;
    locked.current = false;
    unlockBodyScroll();
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      if (!locked.current) {
        locked.current = true;
        lockBodyScroll();
      }
      setPresent(true);
    }
  }, [isOpen]);

  // Paint the closed state once, then transition: setting both in the same
  // frame would show the panel already open.
  useEffect(() => {
    if (!present) return;
    if (isOpen) {
      if (prefersReducedMotion) {
        setShown(true);
        return;
      }
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    if (prefersReducedMotion) {
      setPresent(false);
      releaseLock();
      return;
    }
    // onTransitionEnd is the normal path; this is the backstop for a panel
    // whose transition never fires (a background tab, say).
    const timer = window.setTimeout(() => {
      setPresent(false);
      releaseLock();
    }, EXIT_MS + 120);
    return () => window.clearTimeout(timer);
  }, [isOpen, present, prefersReducedMotion, releaseLock]);

  // Last line of defence: never leave the body locked behind us.
  useEffect(() => releaseLock, [releaseLock]);

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

  const bigLink =
    // The row and its type answer to the window's height as well as its
    // width. Driven by width alone, a phone held sideways got portrait-sized
    // rows in a 390px-tall window and five links became a list you had to
    // scroll. The floor is still well over a 44px target.
    "flex min-h-[clamp(52px,9.5vh,96px)] items-center border-b border-border text-[min(clamp(30px,4.6vw,52px),9vh)] font-bold leading-none tracking-[-0.035em] text-foreground transition-colors hover:text-link motion-reduce:transition-none";
  const smallLink =
    "flex min-h-[44px] items-center text-[17px] font-semibold text-foreground transition-colors hover:text-link motion-reduce:transition-none";

  const goHome = () => {
    close();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  // No document during the build-time prerender, so nothing to portal into.
  if (!mounted || !present) return null;

  return createPortal(
    <div
      ref={panelRef}
      onKeyDown={handleKeyDown}
      onTransitionEnd={(event) => {
        // Only the panel's own opacity; a child's hover transition bubbles
        // here too and would tear the panel out mid-open.
        if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
        if (isOpen) return;
        setPresent(false);
        releaseLock();
      }}
      id={MENU_ID}
      role="dialog"
      aria-modal="true"
      aria-labelledby="main-menu-title"
      style={{ opacity: shown ? 1 : 0 }}
      className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-y-auto overscroll-contain bg-background pr-[max(0px,100%_-_var(--page-width,100%))] transition-opacity duration-200 ease-out motion-reduce:transition-none"
    >
      <h2 id="main-menu-title" className="sr-only">
        {t("nav.mainMenu")}
      </h2>

      {/* The header's own row, repeated inside the panel, hairline included.
          The real header is underneath the opaque panel, so this is what the
          reader sees; repeating it keeps the close control inside the focus
          trap instead of stranded behind it, and keeping the border means
          nothing about the header appears to change except the glyph. */}
      <div className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-[10px] sm:px-8 lg:px-12">
          <Link
            to="/"
            onClick={goHome}
            aria-label={t("nav.homeAria")}
            className="flex min-h-[44px] items-center text-[clamp(19px,5vw,22px)] font-bold tracking-[-0.02em] text-foreground"
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
            <MenuGlyph open={shown} />
          </button>
        </div>
      </div>

      <div
        style={
          prefersReducedMotion
            ? undefined
            : { transform: shown ? "none" : "translateY(10px)", transition: "transform 260ms cubic-bezier(0.22,0.61,0.36,1)" }
        }
        className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-[clamp(32px,6vh,64px)] px-5 pb-[calc(clamp(32px,6vh,64px)+env(safe-area-inset-bottom))] pt-[clamp(32px,7vh,80px)] sm:px-8 lg:px-12"
      >
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
          {/* -mx-3 so the buttons' own padding does not push the pair out of
              line with the text links beside them. */}
          <LanguageToggle className="-mx-3" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
