import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { STATS_WEBHOOK_URL } from "@/lib/site";

type Stats = { mensajes: number; leads: number; visitas: number };

const REFRESH_MS = 60_000;
const COUNT_UP_MS = 1400;

function parseStats(data: unknown): Stats | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const out: Partial<Stats> = {};
  for (const k of ["mensajes", "leads", "visitas"] as const) {
    const n = Number(d[k]);
    if (!Number.isFinite(n) || n < 0) return null;
    out[k] = Math.floor(n);
  }
  return out as Stats;
}

/** Eases a number from where it is to `target`; jumps straight there under reduced motion. */
function useCountUp(target: number, run: boolean, reduce: boolean) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      setValue(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const origin = from.current;
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(origin + (target - origin) * eased));
      if (p < 1) frame = requestAnimationFrame(step);
      else from.current = target;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, run, reduce]);
  return value;
}

function Figure({ value, label, run, reduce, locale }: { value: number; label: string; run: boolean; reduce: boolean; locale: string }) {
  const shown = useCountUp(value, run, reduce);
  return (
    <div className="flex flex-col items-center gap-1 px-4 text-center">
      <span className="text-3xl font-bold tabular-nums text-foreground md:text-4xl">
        {shown.toLocaleString(locale)}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * Running totals of what the agents have done for every client: messages
 * answered, contacts captured, visits booked. Sergio's idea - a live counter
 * that keeps climbing. Every number comes from the database through the n8n
 * flow behind STATS_WEBHOOK_URL and is refreshed every minute; nothing is
 * estimated or simulated between refreshes. Until the first good response
 * the component renders nothing, so the prerendered page never shows a
 * placeholder or a made-up figure, and if the flow is off the block simply
 * isn't there.
 */
export function ImpactCounter() {
  const { t, language } = useLanguage();
  const reduce = useReducedMotion() ?? false;
  const [stats, setStats] = useState<Stats | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(STATS_WEBHOOK_URL, { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const parsed = parseStats(await res.json());
        if (parsed && !cancelled) setStats(parsed);
      } catch {
        // Flow not installed or server unreachable: keep whatever we had.
      }
    };
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [stats, inView]);

  if (!stats) return null;

  const locale = language === "es" ? "es-ES" : "en-GB";
  return (
    <div ref={ref} className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-card/70 px-4 py-6">
      <p className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span aria-hidden="true" className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {t("impact.live")} · {t("impact.title")}
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        <Figure value={stats.mensajes} label={t("impact.messages")} run={inView} reduce={reduce} locale={locale} />
        <Figure value={stats.leads} label={t("impact.leads")} run={inView} reduce={reduce} locale={locale} />
        <Figure value={stats.visitas} label={t("impact.visits")} run={inView} reduce={reduce} locale={locale} />
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">{t("impact.note")}</p>
    </div>
  );
}
