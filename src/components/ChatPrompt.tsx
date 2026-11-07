import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "chatPromptSeen";
// Never in the first twenty seconds, whatever else happens: arriving and being
// asked a question is the behaviour everyone has learnt to dismiss, and the
// chat button is now its own way in - the pointer resting on it brings this
// card up at once, so the timed one can afford to wait.
const FLOOR_MS = 20000;
// After that it waits for a sign of interest - a screenful of scrolling, which
// means the visitor is reading rather than bouncing - and asks only then.
const ENGAGED_SCROLL = 0.9;
// If that never comes, it asks anyway, late enough to be a second thought.
const SHOW_AFTER_MS = 45000;
// The pointer has to settle on the chat button before the card comes up, so
// crossing the corner of the screen does not flash it.
const HOVER_IN_MS = 120;
// And it has 260ms to travel the 16px from the button to the card without the
// card going away underneath it.
const HOVER_OUT_MS = 260;
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

/**
 * The demo is playing and they are looking at it. Interrupting that with a
 * question is interrupting the one thing on the page that is doing the
 * selling, so the timed card waits until the clip is behind them.
 *
 * Playing is not enough on its own: the clip autoplays whenever it comes
 * into view and loops, so it can be running two screens above. Half of it
 * has to be on screen as well.
 */
function watchingTheDemo(): boolean {
  const video = document.querySelector<HTMLVideoElement>("#video video");
  if (!video || video.paused || video.ended) return false;
  const box = video.getBoundingClientRect();
  if (box.height === 0) return false;
  const onScreen = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
  return onScreen > box.height / 2;
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
  /** The chat button has a mouse resting on it right now. */
  launcherHovered?: boolean;
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
export function ChatPrompt({ chatOpen, onOpenChat, launcherHovered = false }: ChatPromptProps) {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"waiting" | "shown" | "done">("waiting");
  const [clear, setClear] = useState(false);
  const [announced, setAnnounced] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const engaged = useRef(false);

  // The hover preview, which is a different thing from the timed card even
  // though it is the same card: it is asked for, so it comes at once and
  // leaves when you leave, it never spends the once-per-visitor nudge, and
  // it says nothing to a screen reader - nobody hovers with one.
  const [cardHovered, setCardHovered] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const wanted = launcherHovered || cardHovered;
    const timer = window.setTimeout(
      () => setPreview(wanted),
      wanted ? HOVER_IN_MS : HOVER_OUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [launcherHovered, cardHovered]);

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
      if (watchingTheDemo()) return;
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

  /** On screen, for whichever of the two reasons. */
  const open = !chatOpen && (phase === "shown" || preview);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Kept in the tree while it leaves, so the exit is the entrance in
  // reverse rather than the card blinking out of existence.
  const [present, setPresent] = useState(false);
  useEffect(() => {
    if (open) setPresent(true);
    // Nothing transitions under reduced motion, so nothing would ever tell
    // us the exit had finished.
    else if (reduceMotion) setPresent(false);
  }, [open, reduceMotion]);

  /**
   * The entrance. React renders the card already at its resting values, so
   * there is nothing for a transition to run from and the card would simply
   * be there. This puts the starting values on it, makes the browser take
   * them (reading offsetHeight is what does that), and then writes the
   * resting values back - the same ones React just wrote, so the two never
   * disagree and the next render changes nothing.
   *
   * Deliberately not requestAnimationFrame: a frame may never come. Under a
   * test clock, in a background tab, on a page the browser has stopped
   * painting, the card would sit at opacity 0 for as long as it was up.
   */
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    const node = ref.current;
    const entering = open && !wasOpen.current;
    wasOpen.current = open;
    if (!node || !entering || reduceMotion) return;
    node.style.transition = "none";
    node.style.opacity = "0";
    node.style.transform = "translateY(8px)";
    void node.offsetHeight;
    node.style.transition = "";
    node.style.opacity = "1";
    node.style.transform = "none";
  }, [open, present, reduceMotion]);

  // On `present`, not on `open`: the card goes into the tree a render after
  // `open` turns true, so keyed on `open` this ran while there was still
  // nothing to measure, left `clear` false, and the card stayed hidden for
  // as long as it was up.
  useLayoutEffect(() => {
    if (present) checkClear();
  }, [present, open, checkClear]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, checkClear]);

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
      {present && (
        <div
          ref={ref}
          data-chat-prompt
          onPointerEnter={(event) => {
            engaged.current = true;
            if (event.pointerType === "mouse") setCardHovered(true);
          }}
          onPointerLeave={(event) => {
            engaged.current = false;
            if (event.pointerType === "mouse") setCardHovered(false);
          }}
          onFocus={() => (engaged.current = true)}
          onBlur={() => (engaged.current = false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") finish();
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
            if (!open) setPresent(false);
          }}
          /* It comes up out of the button and goes back down into it: one
             path, both directions. The transition itself is in .sp-pop. */
          style={{ opacity: open ? 1 : 0, transform: open ? "none" : "translateY(8px)" }}
          className={cn(
            "sp-pop",
            // The widest it gets is a phone's width less the gutters; the
            // bottom offset clears the 64px button and its 20px inset.
            "fixed bottom-[100px] right-5 z-50 w-[min(21rem,calc(100vw-2.5rem))]",
            !clear && "invisible",
            // Nothing to press while it is on its way out.
            !open && "pointer-events-none",
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
