// src/components/ClientAccessButton.tsx
type Props = { variant?: "desktop" | "mobile"; onNavigate?: () => void };

export default function ClientAccessButton({ variant = "desktop", onNavigate }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[#1B7CFF]";

  const styles =
    variant === "mobile"
      ? "w-full px-5 py-3 text-base bg-[#1B7CFF] text-white hover:bg-[#0A1F4A]"
      : "px-5 py-2.5 text-sm bg-[#1B7CFF] text-white hover:bg-[#0A1F4A]";

  return (
    <a
      href="https://panel.simpliaspain.com"
      target="_blank"
      rel="noopener"
      onClick={onNavigate}
      className={`${base} ${styles}`}
      aria-label="Acceder al panel de cliente de Simplia"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      Acceso clientes
    </a>
  );
}
