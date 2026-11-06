import { cn } from "@/lib/utils";

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
    // Not an empty frame: the client's name, set as a label. It occupies the
    // same place the mark will and reads as attribution on its own.
    return (
      <p className={cn("m-0 text-[15px] font-semibold uppercase leading-[1.3] tracking-[0.08em] text-foreground", className)}>
        {name}
      </p>
    );
  }

  return (
    <p className={cn("m-0", className)}>
      {/* The export's slot: 132 x 44, contained and never cropped, so whatever
          shape the client's file is it sits on the same baseline as the text
          beside it. */}
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        className="h-11 w-[132px] object-contain object-left"
      />
    </p>
  );
}
