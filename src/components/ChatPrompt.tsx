import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chatPromptSeen";
// 8s on the page: long enough to read the hero first, so the bubble is not
// the first thing a visitor meets.
const SHOW_AFTER_MS = 8000;
// ...and 2s since the last scroll, click, key or touch, so it never lands
// mid-action.
const IDLE_MS = 2000;
// On screen for 12s of visible, unhovered, unfocused time: well over the 5s
// floor, enough to read it and reach for it. Hover or focus pauses it.
const VISIBLE_MS = 12000;
const INTERACTIVE = 'a[href], button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])';

/** Show only if we can both read and write the "seen" flag; otherwise it
 *  would come back on every page load, so fail to "do not show". */
function storageAllowsPrompt(): boolean {
  try {
    if (localStorage.getItem(STORAGE_KEY) !== null) return false;
    localStorage.setItem(`${STORAGE_KEY}:probe`, "1");
    localStorage.removeItem(`${STORAGE_KEY}:probe`);
    return true;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage went away after the probe; the prompt is already done for
    // this page view either way.
  }
}

interface ChatPromptProps {
  chatOpen: boolean;
  onOpenChat: () => void;
}

/**
 * First-visit nudge beside the chat button: "¿En qué puedo ayudarte?".
 *
 * Shown once per visitor, after SHOW_AFTER_MS on the page and IDLE_MS of no
 * interaction, never while a dialog or the menu is open or a form field has
 * focus, and never over the open chat. The "seen" flag is written the moment
 * it shows, and when the chat is opened by any route.
 *
 * It must not cover anything interactive: while shown it checks its own box
 * against every visible control and hides (visibility only) whenever it would
 * overlap one, e.g. as the page scrolls under it. It never takes focus; it is
 * reachable by Tab and dismissed by its close control or Escape. The text is
 * announced through a polite live region when it first becomes visible.
 * Under prefers-reduced-motion it appears and disappears without animation.
 */
export function ChatPrompt({ chatOpen, onOpenChat }: ChatPromptProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"waiting" | "shown" | "done">("waiting");
  const [clear, setClear] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const engaged = useRef(false);

  const finish = useCallback(() => {
    markSeen();
    setPhase("done");
  }, []);

  // Wait for the right moment.
  useEffect(() => {
    if (phase !== "waiting") return;
    if (!storageAllowsPrompt()) {
      setPhase("done");
      return;
    }
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const start = Date.now();
    let lastInteraction = start;
    const touch = () => {
      lastInteraction = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"];
    events.forEach((name) => window.addEventListener(name, touch, { passive: true, capture: true }));
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (now - start < SHOW_AFTER_MS || now - lastInteraction < IDLE_MS) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"], #main-menu')) return;
      if (document.activeElement?.matches("input, textarea, select, [contenteditable='true']")) return;
      markSeen();
      setPhase("shown");
    }, 500);
    return () => {
      window.clearInterval(timer);
      events.forEach((name) => window.removeEventListener(name, touch, { capture: true }));
    };
  }, [phase]);

  // Opening the chat by any route ends it for good.
  useEffect(() => {
    if (chatOpen && phase !== "done") finish();
  }, [chatOpen, phase, finish]);

  // Never sit over an interactive element.
  const checkClear = useCallback(() => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    let overlap = false;
    for (const el of document.querySelectorAll<HTMLElement>(INTERACTIVE)) {
      if (ref.current?.contains(el) || el.closest("[aria-hidden='true'], [inert]")) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top) {
        overlap = true;
        break;
      }
    }
    setClear(!overlap);
  }, []);

  useLayoutEffect(() => {
    if (phase === "shown") checkClear();
  }, [phase, checkClear]);

  useEffect(() => {
    if (phase !== "shown") return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(checkClear);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [phase, checkClear]);

  // Announce once, when it is first actually visible.
  useEffect(() => {
    if (phase === "shown" && clear && !announced) setAnnounced(true);
  }, [phase, clear, announced]);

  // Auto-dismiss after VISIBLE_MS of visible, unengaged time.
  useEffect(() => {
    if (phase !== "shown") return;
    let visibleFor = 0;
    const timer = window.setInterval(() => {
      if (!clear || engaged.current) return;
      visibleFor += 250;
      if (visibleFor >= VISIBLE_MS) finish();
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase, clear, finish]);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announced && phase === "shown" ? t("chat.prompt") : ""}
      </div>
      {phase === "shown" && !chatOpen && (
        <div
          ref={ref}
          data-chat-prompt
          onMouseEnter={() => (engaged.current = true)}
          onMouseLeave={() => (engaged.current = false)}
          onFocus={() => (engaged.current = true)}
          onBlur={() => (engaged.current = false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") finish();
          }}
          className={cn(
            "fixed bottom-24 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-stretch rounded-2xl border border-border bg-card text-card-foreground shadow-lg",
            !clear && "invisible",
            !reduceMotion && "animate-in fade-in-0 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none",
          )}
        >
          <button
            type="button"
            onClick={() => {
              finish();
              onOpenChat();
            }}
            className="min-h-11 flex-1 rounded-l-2xl py-3 pl-4 pr-2 text-left text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("chat.prompt")}
          </button>
          <button
            type="button"
            onClick={finish}
            aria-label={t("chat.promptDismiss")}
            className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-r-2xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
