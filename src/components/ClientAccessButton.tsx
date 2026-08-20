// src/components/ClientAccessButton.tsx
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type Props = {
  /** Visual emphasis only - never layout. Pass className for width/height. */
  variant?: "secondary" | "primary";
  /** Distinguishes the two entry points server-side (no analytics library in this project). */
  source?: "header" | "menu";
  onNavigate?: () => void;
  className?: string;
};

export default function ClientAccessButton({
  variant = "secondary",
  source = "header",
  onNavigate,
  className,
}: Props) {
  const { t } = useLanguage();

  return (
    <Button
      asChild
      variant={variant === "secondary" ? "outline" : "default"}
      className={cn("rounded-full px-4 font-semibold", className)}
    >
      <a
        href={`https://panel.simpliaspain.com/?ref=${source}`}
        target="_blank"
        rel="noopener"
        onClick={onNavigate}
      >
        {/* Login glyph. panel.simpliaspain.com is our own subdomain, so no
            external-link arrow - the new tab is announced instead. */}
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        {t("nav.clientAccess")}
        <span className="sr-only">{t("nav.opensNewTab")}</span>
      </a>
    </Button>
  );
}
