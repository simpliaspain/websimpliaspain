/**
 * A client's own mark, used to attribute a case study to them.
 *
 * The files are picked up from src/assets/clients by their tenant slug, so
 * adding one is dropping a file in that folder - there is no import to write
 * and nothing to wire up. Until the file exists the component falls back to
 * the client's name set as a small label, which reads as attribution rather
 * than as a logo someone forgot to supply. See that folder's README.
 *
 * `eager` so the URL is resolved at build time and the mark is in the
 * prerendered HTML; the glob is a literal because Vite has to be able to
 * read it statically.
 */
const LOGOS = import.meta.glob("../assets/clients/*.{svg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function findLogo(slug: string): string | undefined {
  const entry = Object.entries(LOGOS).find(([path]) => {
    const file = path.split("/").pop() ?? "";
    return file.replace(/\.[^.]+$/, "") === slug;
  });
  return entry?.[1];
}

export function ClientMark({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const src = findLogo(slug);

  if (!src) {
    return (
      <p className={className}>
        <span className="text-[15px] font-semibold uppercase tracking-[0.08em] text-foreground">{name}</span>
      </p>
    );
  }

  return (
    <p className={className}>
      {/* Height-constrained and never cropped, so whatever shape the client's
          file is, it sits on the same baseline as every other mark. */}
      <img src={src} alt={name} loading="lazy" decoding="async" className="h-7 w-auto max-w-[220px] object-contain" />
    </p>
  );
}
