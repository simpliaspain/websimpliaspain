// src/components/ClientAccessButton.tsx
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Visual emphasis, not breakpoint: outline in the header, filled inside the menu. */
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
  return (
    <Button
      asChild
      variant={variant === "secondary" ? "outline" : "default"}
      className={cn(
        "rounded-full px-4 font-semibold",
        variant === "primary" && "h-12 w-full text-base",
        className,
      )}
    >
      <a
        href={`https://panel.simpliaspain.com/?ref=${source}`}
        target="_blank"
        rel="noopener"
        onClick={onNavigate}
        aria-label="Acceder al panel de cliente de Simplia"
      >
        <svg viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Acceso clientes
        <ArrowUpRight aria-hidden="true" />
      </a>
    </Button>
  );
}
