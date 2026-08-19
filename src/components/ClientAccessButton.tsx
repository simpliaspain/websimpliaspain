// src/components/ClientAccessButton.tsx
import { Button } from "@/components/ui/button";

type Props = { variant?: "desktop" | "mobile"; onNavigate?: () => void };

export default function ClientAccessButton({ variant = "desktop", onNavigate }: Props) {
  return (
    <Button
      asChild
      className={
        variant === "mobile"
          ? "w-full h-12 rounded-full px-5 text-base font-semibold"
          : "rounded-full px-5 font-semibold"
      }
    >
      <a
        href="https://panel.simpliaspain.com"
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
      </a>
    </Button>
  );
}
