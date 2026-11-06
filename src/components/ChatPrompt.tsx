import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chatPromptSeen";
// Never in the first few seconds, whatever else happens: arriving and being
// asked a question is the behaviour everyone has learnt to dismiss.
const FLOOR_MS = 6000;
// After that it waits for a sign of interest - a screenful of scrolling, which
// means the visitor is reading rather than bouncing - and asks only then.
const ENGAGED_SCROLL = 0.9;
// If that never comes, it asks anyway, late enough to be a second thought.
const SHOW_AFTER_MS = 22000;
// Either way, 2s since the last scroll, click, key or touch, so it lands in a
// pause rather than under a moving thumb.
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
 * Shown once per visitor, and at the moment it is least in the way: never in
 * the first FLOOR_MS, then as soon as a screenful of scrolling says the page
 * is being read, or after SHOW_AFTER_MS if it never is, and in both cases
 * only after IDLE_MS with nothing moving. Never while a dialog or the menu is
 * open or a form field has focus, and never over the open chat. The "seen"
 * flag is written the moment it shows, and when the chat is opened by any
 * route.
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
    let engaged = false;
    const touch = () => {
      lastInteraction = Date.now();
      if (window.scrollY > window.innerHeight * ENGAGED_SCROLL) engaged = true;
    };
    const events = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"];
    events.forEach((name) => window.addEventListener(name, touch, { passive: true, capture: true }));
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (now - start < FLOOR_MS) return;
      if (!engaged && now - start < SHOW_AFTER_MS) return;
      if (now - lastInteraction < IDLE_MS) return;
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
            // The widest it gets is a phone's width less the gutters; the
            // bottom offset clears the 64px button and its 20px inset.
            "fixed bottom-[100px] right-5 z-50 w-[min(21rem,calc(100vw-2.5rem))]",
            !clear && "invisible",
            !reduceMotion && "animate-in fade-in-0 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none",
          )}
        >
          <div className="relative rounded-[18px] border border-border bg-card text-card-foreground shadow-[0_18px_40px_-16px_hsl(220_20%_6%_/_0.3)]">
            {/* The card is one target: anywhere on it opens the chat, the way
                tapping a notification opens the conversation it came from. */}
            <button
              type="button"
              onClick={() => {
                finish();
                onOpenChat();
              }}
              className="block w-full rounded-[18px] px-4 pb-4 pt-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-2.5 pr-7">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-[15px] font-bold leading-none text-white"
                >
                  S
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold leading-tight text-foreground">
                    {t("chat.promptWho")}
                  </span>
                  <span className="block truncate text-[13px] leading-tight text-[hsl(148_83%_26%)]">
                    {t("chat.promptStatus")}
                  </span>
                </span>
              </span>
              {/* The agent's own bubble, drawn exactly as the example
                  conversation draws one, tail and all. */}
              <span className="mt-3 block rounded-[16px_16px_16px_4px] bg-accent px-3.5 py-2.5 text-[15px] leading-[1.4] text-foreground">
                {t("chat.prompt")}
              </span>
            </button>
            <button
              type="button"
              onClick={finish}
              aria-label={t("chat.promptDismiss")}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {/* Points at the button it came out of. */}
            <span
              aria-hidden="true"
              className="absolute -bottom-[7px] right-7 h-3 w-3 rotate-45 border-b border-r border-border bg-card"
            />
          </div>
        </div>
      )}
    </>
  );
}
