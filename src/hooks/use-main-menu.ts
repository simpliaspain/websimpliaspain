import { useCallback, useEffect, useRef, useState } from "react";

export const MENU_ID = "main-menu";
export const MENU_TRIGGER_ID = "main-menu-trigger";

const HOVER_OPEN_DELAY = 120;
const HOVER_CLOSE_GRACE = 250;

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
