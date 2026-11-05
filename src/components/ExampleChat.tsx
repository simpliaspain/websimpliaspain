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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(216_10%_90%)] text-[15px] font-extrabold text-foreground"
          >
            M
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold leading-tight text-foreground">{t("example.who")}</p>
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
          {/* Everything is in the DOM at all times and only its opacity
              changes, so playback never reflows the card or the page. */}
          {messages.map((m, i) => {
            const visible = i < shown;
            const client = m.from === "client";
            return (
              <div
                key={m.key}
                aria-hidden={!visible}
                style={{ opacity: visible ? 1 : 0 }}
                className={cn(
                  "max-w-[88%] px-3.5 pb-1.5 pt-2.5 transition-opacity duration-200 motion-reduce:transition-none",
                  client
                    ? "justify-self-start rounded-[16px_16px_16px_4px] bg-[hsl(220_13%_96%)]"
                    : "grid justify-self-end gap-2 rounded-[16px_16px_4px_16px] bg-accent",
                )}
              >
                <p className="m-0">{t(m.key)}</p>
                {m.card && (
                  <span className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 rounded-[10px] border border-[hsl(213_48%_87%)] bg-card p-2">
                    <span className="row-span-2 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-md bg-secondary text-muted-foreground">
                      <ImageIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="self-end font-bold text-foreground">{t("example.cardTitle")}</span>
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
            );
          })}

          {unanswered && (
            /* The point of the hero: the message just sits there. */
            <p className="m-0 justify-self-center text-sm text-muted-foreground">{t("example.noAnswer")}</p>
          )}

          {typing && (
            <div className="flex items-center gap-1.5 justify-self-end rounded-[16px_16px_4px_16px] bg-accent px-4 py-3.5">
              <span className="sr-only">{t("example.typing")}</span>
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  aria-hidden="true"
                  className="h-[7px] w-[7px] animate-pulse rounded-full bg-link"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
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
