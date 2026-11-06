import { useCallback, useEffect, useRef, useState } from "react";

export const MENU_ID = "main-menu";
export const MENU_TRIGGER_ID = "main-menu-trigger";

/**
 * How long the pointer has to rest on the trigger before the menu opens.
 * Long enough that crossing the corner on the way somewhere else does not
 * trigger it, and that a pointer arriving to click is usually still in
 * flight - see HOVER_CLICK_GRACE_MS for the press that lands anyway.
 */
const HOVER_INTENT_MS = 180;

/**
 * How long after a close the trigger ignores hover. Without it, closing the
 * menu with its own button leaves the pointer sitting exactly where the
 * trigger is - the panel's close button is drawn over it - and the menu
 * reopens immediately under the cursor.
 */
const REOPEN_GRACE_MS = 500;

/**
 * How long after the menu opens *by itself*, under a pointer that was on its
 * way to click, a pointer dismissal is treated as that same click arriving
 * late rather than as "close this".
 *
 * Reaching for the trigger and pressing it takes a person a few hundred
 * milliseconds; hover opens the panel in 140. The press then landed on the
 * panel's close button, which is drawn at exactly the same place and sits
 * above the header, so the menu they had just asked for flashed open and
 * shut under their finger. Within this window the press means what it always
 * meant - open - so it is swallowed and the menu stays. Nobody decides to
 * close a panel in the half second it takes to fade in; the second press
 * closes it as usual, and Escape always does.
 *
 * Measured in a browser: a press up to about 830ms after the pointer reaches
 * the trigger keeps the menu open, and anything later closes it. Reaching
 * and pressing lands inside that; deciding to dismiss a panel you have just
 * read does not.
 */
const HOVER_CLICK_GRACE_MS = 650;

/**
 * The menu is one full-screen panel at every width, opened by hover or by
 * click (hover added 06/11/2026).
 *
 * Hover only counts on a device that really has a pointer: `(hover: hover)
 * and (pointer: fine)` excludes touch, where the browser synthesises a hover
 * on tap and would open the menu from a stray finger. The intent delay stops
 * a pointer crossing the corner on its way elsewhere from opening it, and
 * the grace period after a close stops it springing straight back open.
 *
 * Clicking always wins: it opens with no delay and closes an open menu, and
 * it cancels any hover that was in flight - except for the one press that
 * was already on its way when hover opened the panel for it, which would
 * otherwise shut it again the instant it appeared. See HOVER_CLICK_GRACE_MS.
 */
export type MainMenuController = ReturnType<typeof useMainMenuController>;

export function useMainMenuController() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const intentTimer = useRef<number | null>(null);
  const closedAt = useRef(0);
  /** When the menu last opened on hover; 0 when it opened on a click. */
  const hoverOpenedAt = useRef(0);

  const cancelIntent = useCallback(() => {
    if (intentTimer.current !== null) {
      window.clearTimeout(intentTimer.current);
      intentTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelIntent();
    closedAt.current = Date.now();
    hoverOpenedAt.current = 0;
    setIsOpen(false);
  }, [cancelIntent]);

  const open = useCallback(
    (element?: HTMLElement | null, byHover = false) => {
      cancelIntent();
      if (element) triggerRef.current = element;
      hoverOpenedAt.current = byHover ? Date.now() : 0;
      setIsOpen(true);
    },
    [cancelIntent],
  );

  /**
   * Close on a pointer press - the close control, the trigger - as opposed to
   * Escape, a link or a route change, which always close. See
   * HOVER_CLICK_GRACE_MS: a press this soon after the panel opened itself is
   * the press that was already on its way, and it is swallowed once.
   */
  const dismiss = useCallback(() => {
    if (hoverOpenedAt.current && Date.now() - hoverOpenedAt.current < HOVER_CLICK_GRACE_MS) {
      hoverOpenedAt.current = 0;
      return;
    }
    close();
  }, [close]);

  // Escape closes from anywhere, including when focus has left the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => cancelIntent, [cancelIntent]);

  const canHover = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const triggerProps = {
    id: MENU_TRIGGER_ID,
    "aria-expanded": isOpen,
    "aria-controls": MENU_ID,
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (isOpen) {
        dismiss();
        return;
      }
      open(event.currentTarget);
    },
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || isOpen || !canHover()) return;
      if (Date.now() - closedAt.current < REOPEN_GRACE_MS) return;
      const element = event.currentTarget;
      cancelIntent();
      intentTimer.current = window.setTimeout(() => {
        intentTimer.current = null;
        open(element, true);
      }, HOVER_INTENT_MS);
    },
    onPointerLeave: cancelIntent,
    // A keyboard user tabbing onto the trigger must not have it open under
    // them; they press Enter or Space, which is the click above.
    onFocus: cancelIntent,
  };

  return { isOpen, open, close, dismiss, triggerRef, triggerProps };
}
