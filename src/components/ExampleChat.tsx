import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type Message = { from: "client" | "agent"; key: string; time: string; card?: boolean };

/**
 * One conversation, told twice. Marta writes at 20:53, when the centre has
 * been shut for hours; the hero shows that message with nobody to take it,
 * and the section below shows the same message answered. Keeping both in one
 * component means the two can never drift apart.
 */
const MESSAGES: Message[] = [
  { from: "client", key: "example.m1", time: "20:53" },
  { from: "agent", key: "example.m2", time: "20:53", card: true },
  { from: "agent", key: "example.m3", time: "20:53" },
  { from: "client", key: "example.m4", time: "20:55" },
  { from: "agent", key: "example.m5", time: "20:55" },
];

/** Milliseconds from the card coming into view to each message landing. */
function schedule(messages: Message[]) {
  const steps: { at: number; shown: number; typing: boolean }[] = [];
  let t = 400;
  messages.forEach((m, i) => {
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
    setShown(0);
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
    setShown(0);
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

  useEffect(() => {
    if (unanswered || played) return;
    const node = cardRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[entries.length - 1].isIntersecting) play();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unanswered, played]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const done = played && shown === messages.length;

  return (
    <figure className={cn("m-0 grid content-start gap-3", className)}>
      {/* The bloom sits on a wrapper, not on the card: the card clips its own
          overflow for the rounded corners and would cut the glow off. */}
      <div ref={cardRef} className="bloom">
        <div className="flex flex-col overflow-hidden rounded-[18px] border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-[18px] py-3.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(216_10%_90%)] text-[15px] font-bold text-foreground"
          >
            M
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
            unanswered ? "min-h-[260px] content-end gap-4 px-[18px] pb-6 pt-7" : "content-end gap-2.5 px-[18px] py-5",
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
                    <span className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 rounded-[10px] border border-[hsl(213_48%_87%)] bg-card p-2">
                      <span className="row-span-2 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-md bg-secondary text-muted-foreground">
                        <ImageIcon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <span className="self-end font-semibold text-foreground">{t("example.cardTitle")}</span>
                      <span className="self-start text-sm text-muted-foreground">{t("example.cardSub")}</span>
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

      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{t("example.footnote")}</span>
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
