import { Image as ImageIcon, CheckCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type Message = { from: "client" | "agent"; key: string; time: string; photos?: boolean };

const MESSAGES: Message[] = [
  { from: "client", key: "example.m1", time: "23:47" },
  { from: "agent", key: "example.m2", time: "23:47", photos: true },
  { from: "client", key: "example.m3", time: "23:48" },
  { from: "agent", key: "example.m4", time: "23:48" },
];

/**
 * The hero's example conversation, with the time on show: the point is that
 * it happens on a Sunday night. Static markup, so it is in the prerendered
 * HTML and readable without JavaScript. Deliberately no WhatsApp branding -
 * the chat look is enough. The centre is fictional and says so.
 */
export function ExampleChat({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <figure className={cn("w-full max-w-md", className)}>
      <div
        role="img"
        aria-label={t("example.aria")}
        className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_20px_60px_-15px_hsl(var(--primary)/0.25)]"
      >
        <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-5 py-3">
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            CA
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold text-foreground">{t("example.center")}</span>
            <span className="block text-xs text-muted-foreground">{t("example.agent")}</span>
          </span>
          <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground">
            {t("example.when")}
          </span>
        </div>

        <div aria-hidden="true" className="space-y-3 bg-background/60 px-4 py-5 text-left">
          {MESSAGES.map((m) => (
            <div key={m.key} className={cn("flex", m.from === "client" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-sm",
                  m.from === "client"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm border border-border bg-card text-foreground",
                )}
              >
                {m.photos && (
                  <span className="mb-2 grid grid-cols-2 gap-1.5">
                    <span className="flex h-14 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </span>
                    <span className="flex h-14 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </span>
                  </span>
                )}
                <span className="block">{t(m.key)}</span>
                <span
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums",
                    m.from === "client" ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                  {m.from === "client" && <CheckCheck className="h-3.5 w-3.5" />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">{t("example.footnote")}</figcaption>
    </figure>
  );
}
