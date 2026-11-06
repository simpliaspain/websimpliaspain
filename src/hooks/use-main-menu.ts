import { useCallback, useEffect, useRef, useState } from "react";

export const MENU_ID = "main-menu";
export const MENU_TRIGGER_ID = "main-menu-trigger";

/** How long the pointer has to rest on the trigger before the menu opens. */
const HOVER_INTENT_MS = 140;

/**
 * How long after a close the trigger ignores hover. Without it, closing the
 * menu with its own button leaves the pointer sitting exactly where the
 * trigger is - the panel's close button is drawn over it - and the menu
 * reopens immediately under the cursor.
 */
const REOPEN_GRACE_MS = 500;

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
 * it cancels any hover that was in flight.
 */
export type MainMenuController = ReturnType<typeof useMainMenuController>;

export function useMainMenuController() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const intentTimer = useRef<number | null>(null);
  const closedAt = useRef(0);

  const cancelIntent = useCallback(() => {
    if (intentTimer.current !== null) {
      window.clearTimeout(intentTimer.current);
      intentTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelIntent();
    closedAt.current = Date.now();
    setIsOpen(false);
  }, [cancelIntent]);

  const open = useCallback(
    (element?: HTMLElement | null) => {
      cancelIntent();
      if (element) triggerRef.current = element;
      setIsOpen(true);
    },
    [cancelIntent],
  );

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
        close();
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
        open(element);
      }, HOVER_INTENT_MS);
    },
    onPointerLeave: cancelIntent,
    // A keyboard user tabbing onto the trigger must not have it open under
    // them; they press Enter or Space, which is the click above.
    onFocus: cancelIntent,
  };

  return { isOpen, open, close, triggerRef, triggerProps };
}
