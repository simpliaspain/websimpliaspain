import { useCallback, useEffect, useRef, useState } from "react";

export const MENU_ID = "main-menu";
export const MENU_TRIGGER_ID = "main-menu-trigger";

/**
 * The menu is one full-screen panel at every width (redesign, 05/11/2026).
 *
 * It used to have a second, non-modal mode: a hover-intent dropdown on fine
 * pointers at lg and up, because the header carried a row of links and a
 * services panel. The redesign empties the header down to the logo and this
 * trigger, so there is one mode and one behaviour to reason about, and the
 * hover-intent timers, the click-toggle guard and the mode-flip cleanup are
 * all gone with it.
 */
export type MainMenuController = ReturnType<typeof useMainMenuController>;

export function useMainMenuController() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const open = useCallback((element?: HTMLElement | null) => {
    if (element) triggerRef.current = element;
    setIsOpen(true);
  }, []);

  // Escape closes from anywhere, including when focus has left the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

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
  };

  return { isOpen, open, close, triggerRef, triggerProps };
}
