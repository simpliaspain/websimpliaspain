import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Photo } from "@/components/Photo";
import { cn } from "@/lib/utils";

type Message = { from: "client" | "agent"; key: string; time: string; card?: boolean };

/** Drop src/assets/photos/despacho-8.jpg in and the card grows a picture. */
const OFFICE_PHOTO = "despacho-8";

/**
 * One conversation, told twice. Marta writes at 20:53, when the centre has
 * been shut for hours; the hero shows that message with nobody to take it,
 * and the section below shows the same message answered. Keeping both in one
 * component means the two can never drift apart.
 *
 * The name and the hours are the design's, and the design is what the client
 * decided. The demo video beside this card in #accion shows a different
 * scene - Lucía at 21:47 - so the two do not match; that is known and it is
 * their call. Changing one of them means changing the other, here and in
 * hero.time, hero.title, closing.title and cta.titleEmph.
 */
const MESSAGES: Message[] = [
  { from: "client", key: "example.m1", time: "20:53" },
  { from: "agent", key: "example.m2", time: "20:53", card: true },
  { from: "agent", key: "example.m3", time: "20:53" },
  { from: "client", key: "example.m4", time: "20:55" },
  { from: "agent", key: "example.m5", time: "20:55" },
];

/** Milliseconds from the card coming into view to each message landing. */
/** Playback starts from FIRST_SHOWN, so the client's own message is already
 *  on screen: the card is never an empty frame waiting to be scrolled to, and
 *  what plays is what the page is actually claiming - the answer. */
const FIRST_SHOWN = 1;

/**
 * The room kept under the card for the replay control, which is taken out of
 * the flow and centred there. Anything laid out beside the card and meant to
 * end level with it reserves the same - HomeAnswer's invitation does, with
 * `lg:mb-9`. One number, both places; change them together.
 */
const CAPTION_ROOM = "pb-9";

function schedule(messages: Message[]) {
  const steps: { at: number; shown: number; typing: boolean }[] = [];
  let t = 400;
  messages.forEach((m, i) => {
    if (i < FIRST_SHOWN) return;
    if (m.from === "agent") {
      steps.push({ at: t, shown: i, typing: true });
      t += 1100;
    } else {
      t += 700;
    }
    steps.push({ at: t, shown: i + 1, typing: false });
    t += 500;
  });
  return steps;
}

export function ExampleChat({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "unanswered";
}) {
  const { t } = useLanguage();
  const unanswered = variant === "unanswered";
  const messages = unanswered ? MESSAGES.slice(0, 1) : MESSAGES;

  // Starts fully shown, so the prerendered HTML and a visit without
  // JavaScript both carry the whole conversation. The effect below hides it
  // and plays it back only when the browser can do so.
  const [shown, setShown] = useState(messages.length);
  const [typing, setTyping] = useState(false);
  const [played, setPlayed] = useState(false);
  const [animatable, setAnimatable] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShown(FIRST_SHOWN);
    setTyping(false);
    setPlayed(true);
    for (const step of schedule(messages)) {
      timers.current.push(
        window.setTimeout(() => {
          setShown(step.shown);
          setTyping(step.typing);
        }, step.at),
      );
    }
  };

  useLayoutEffect(() => {
    if (unanswered) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    setShown(FIRST_SHOWN);
  }, [unanswered]);

  // The bubbles carry no transition until the frame after that hide. They
  // start visible - that is what the prerendered HTML says, and what a visit
  // without JavaScript keeps - so transitioning the hide meant the whole
  // conversation appeared on load and then faded away again before playing.
  // Starting at false also matches what the server rendered, so hydration
  // has nothing to disagree about.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatable(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // It has to start when the reader is looking at it, not when its top edge
  // appears. At a third visible and no inset it began while the card was
  // still a strip at the bottom of the window, so by the time you had
  // scrolled to it the whole six-second exchange had already happened. The
  // margin pulls the trigger line well inside the window so playback starts
  // with the card in front of you.
  //
  // Two conditions, because a ratio alone is not enough: most of the card is
  // the right test when the card fits, but on a phone - or any short window -
  // the card is taller than the band and its ratio can never reach 0.6, so it
  // would never start. The second test asks the opposite question, whether
  // the card fills what you are looking at.
  useEffect(() => {
    if (unanswered || played) return;
    const node = cardRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const latest = entries[entries.length - 1];
        if (!latest.isIntersecting) return;
        const fillsTheView = latest.rootBounds
          ? latest.intersectionRect.height / latest.rootBounds.height >= 0.8
          : false;
        if (latest.intersectionRatio >= 0.6 || fillsTheView) play();
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.8], rootMargin: "-12% 0px -22% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unanswered, played]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const done = played && shown === messages.length;

  return (
    <figure className={cn("relative m-0 grid content-start", !unanswered && CAPTION_ROOM, className)}>
      {/* The bloom sits on a wrapper, not on the card: the card clips its own
          overflow for the rounded corners and would cut the glow off. */}
      <div ref={cardRef} className="bloom">
        <div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-[18px] py-3.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(216_10%_90%)] text-[15px] font-bold text-foreground"
          >
            {t("example.who").trim().charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold leading-tight text-foreground">{t("example.who")}</p>
            <p
              className={cn(
                "text-sm leading-tight",
                unanswered ? "text-muted-foreground" : "text-[hsl(148_83%_26%)]",
              )}
            >
              {t(unanswered ? "example.wrote" : "example.answers")}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "grid flex-1 text-base leading-[1.45]",
            /* Answered, the exchange is bottom-aligned, the way a thread sits
               in a messaging app. Unanswered, the message goes to the top and
               the verdict to the foot of the card, so the empty space between
               them is the wait itself - bottom-aligned it was a blank above
               the message instead, which reads as something still loading. */
            unanswered
              ? "min-h-[260px] content-between gap-4 px-[18px] pb-6 pt-5"
              : "content-end gap-2.5 px-[18px] py-5",
          )}
        >
          {/* Every message holds its own slot from the first paint and only
              fades in, so playback never reflows the card. The typing bubble
              is absolutely placed inside the slot of the message it is
              announcing, for the same reason: as its own grid child it
              pushed the whole bottom-aligned list up and down twice per
              message, which is what made playback feel like a series of
              jolts. */}
          {messages.map((m, i) => {
            const visible = i < shown;
            const client = m.from === "client";
            return (
              <div
                key={m.key}
                className={cn("relative max-w-[88%]", client ? "justify-self-start" : "justify-self-end")}
              >
                <div
                  aria-hidden={!visible}
                  style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(7px)" }}
                  className={cn(
                    "px-3.5 pb-1.5 pt-2.5",
                    animatable &&
                      "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none",
                    client
                      ? "rounded-[16px_16px_16px_4px] bg-[hsl(220_13%_96%)]"
                      : "grid gap-2 rounded-[16px_16px_4px_16px] bg-accent",
                  )}
                >
                  <p className="m-0">{t(m.key)}</p>
                  {m.card && (
                    /* The card the agent sends, in the design's own shape: a
                       square picture, the office, and what the card contains.
                       The picture is the soft fill until the photograph is
                       there - drop src/assets/photos/despacho-8.jpg (600x600,
                       @2x alongside it if there is one) in and it fills
                       itself, with no code to change. */
                    <span className="grid grid-cols-[96px_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-[hsl(213_48%_87%)] bg-card">
                      {/* The picture runs to the card's own edges rather than
                          sitting as a small square inside it: a thumbnail
                          with padding around it left a third of the card
                          empty to the right of two short lines, and this is
                          how a link preview is drawn in the app the page is
                          about. It stretches to whatever height the words
                          need, so a narrow phone cannot leave it short. */}
                      <span className="block w-24 self-stretch bg-secondary">
                        <Photo name={OFFICE_PHOTO} alt={t("example.cardAlt")} width={600} height={600} />
                      </span>
                      <span className="flex min-w-0 flex-col justify-center gap-[3px] px-3.5 py-3">
                        <span className="font-semibold leading-[1.25] text-foreground">{t("example.cardTitle")}</span>
                        <span className="text-sm leading-[1.3] text-muted-foreground">{t("example.cardSub")}</span>
                      </span>
                    </span>
                  )}
                  <p
                    className={cn(
                      "m-0 text-right text-xs tabular-nums",
                      client ? "text-muted-foreground" : "text-[hsl(214_15%_32%)]",
                    )}
                  >
                    {m.time}
                  </p>
                </div>

                <div
                  aria-hidden={!(typing && i === shown)}
                  style={{ opacity: typing && i === shown ? 1 : 0 }}
                  className={cn(
                    "pointer-events-none absolute top-0 flex items-center gap-1.5 rounded-[16px_16px_4px_16px] bg-accent px-4 py-3.5 transition-opacity duration-200 motion-reduce:transition-none",
                    client ? "left-0" : "right-0",
                  )}
                >
                  {typing && i === shown && <span className="sr-only">{t("example.typing")}</span>}
                  {[0, 180, 360].map((delay) => (
                    <span
                      key={delay}
                      aria-hidden="true"
                      className="h-[7px] w-[7px] rounded-full bg-link motion-safe:animate-typing-dot"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {unanswered && (
            /* The point of the hero: the message just sits there. */
            <p className="m-0 justify-self-center text-sm text-muted-foreground">{t("example.noAnswer")}</p>
          )}
          </div>
        </div>
      </div>

      {/* Nothing but the replay. It said "Conversación de ejemplo." under a
          card that is self-evidently an example conversation. */}
      {/* Out of the flow and centred under the card, so the card's own
          bottom edge is the bottom of the column and whatever sits beside it
          can end exactly level with it. */}
      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-center text-sm text-muted-foreground">
        {done && (
          <button
            type="button"
            onClick={play}
            className="min-h-[44px] font-semibold text-foreground underline underline-offset-4"
          >
            {t("example.replay")}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
