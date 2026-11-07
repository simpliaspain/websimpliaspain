import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The redesign's signature heading: one enormous figure, and the sentence it
 * belongs to set beside it. The case band and the price band both use it, and
 * they use this so that they cannot drift apart - before, each set its own
 * size, its own nudge and its own alignment, and at 176px against 136px the
 * two bands read as two different ideas.
 *
 * The figure and the sentence sit on a shared **baseline**, not on a shared
 * bottom edge. Bottom-aligned, a figure cropped to 0.86 of its line and a
 * sentence on a 1.12 line sit at whatever offset their leading happens to
 * produce, which is what made the larger of the two look dropped. On the
 * baseline they begin on the same line, the way a figure and its own words
 * do in print, however many lines the sentence runs to and whatever size the
 * figure is cut at.
 *
 * It is one element of text, in one run, so a reader, a crawler and a
 * copy-paste all get "37 % de las consultas..." once and in order.
 */
export function StatHeading({
  id,
  figure,
  children,
  size = "lg",
}: {
  id: string;
  figure: string;
  children: ReactNode;
  /** `lg` leads a band; `md` is for a second one on the same page. */
  size?: "lg" | "md";
}) {
  const figureSize =
    size === "lg"
      ? "text-[clamp(76px,11.5vw,152px)]"
      : "text-[clamp(64px,9vw,124px)]";

  return (
    <h2
      id={id}
      className="m-0 flex flex-wrap items-baseline gap-x-[clamp(20px,3vw,48px)] gap-y-1 text-[clamp(24px,2.8vw,38px)] font-bold leading-[1.2] text-foreground"
    >
      {/* `leading-none` and not tighter: the figure's own box is its line, so
          its baseline is where the text's baseline is, and the gap under it
          is the one the flex row's baseline alignment puts there. The
          negative word-spacing is for the space Spanish puts before the
          per-cent sign, which at this size is 40px of nothing. */}
      {/* The tracking and the word-space belong on the span that carries the
          figure's own font-size, not on this one: an `em` resolves against
          the element it is set on, so on the outer span they were measured
          against the heading's 38px and did about a fifth of their work -
          the figure stayed at its default fitting and the space before the
          per-cent sign was nearly a full word space at 152px. */}
      <span className="flex-none whitespace-nowrap leading-none text-brand tabular-nums">
        <span className={cn(figureSize, "tracking-[-0.055em] [word-spacing:-0.14em]")}>{figure}</span>
      </span>
      <span className="min-w-0 max-w-[620px] flex-[1_1_340px] text-balance">{children}</span>
    </h2>
  );
}
