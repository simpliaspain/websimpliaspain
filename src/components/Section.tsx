import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * The one place home-page sections get their vertical rhythm.
 *
 * Every section used to set its own py-*, so each edit drifted it out of
 * step with its neighbours. Now the padding comes from a named variant here
 * and nothing else: a className that tries to set vertical padding is
 * rejected in development, so a section cannot quietly desynchronise.
 *
 * The scale is fluid (redesign, 05/11/2026): the same clamp() the design
 * uses, so the rhythm tracks the viewport instead of stepping at md.
 *
 *   default  56 → 120px  - the ordinary band
 *   wide     64 → 136px  - the two bands that carry a single large idea,
 *                          the case figure and the closing line
 *   snug     48 → 104px  - a band that belongs with the one above it
 *   tight    py-16       - strip-like companion sections (the logo marquee)
 *   hero     pt-20, no bottom padding - for the pages whose hero is still
 *                          min-h-screen; the home hero sets its own
 */
const VARIANTS = {
  default: "py-[clamp(56px,8vw,120px)]",
  wide: "py-[clamp(64px,9vw,136px)]",
  snug: "py-[clamp(48px,7vw,104px)]",
  tight: "py-16",
  hero: "pt-20",
} as const;

type SectionProps = HTMLAttributes<HTMLElement> & {
  variant?: keyof typeof VARIANTS;
};

const Section = forwardRef<HTMLElement, SectionProps>(({ variant = "default", className, ...props }, ref) => {
  if (import.meta.env.DEV && className && /(^|\s)(sm:|md:|lg:|xl:)?(py|pt|pb)-/.test(className)) {
    throw new Error(
      `Section: vertical padding must come from the variant, not className ("${className}").`,
    );
  }
  return <section ref={ref} className={cn(VARIANTS[variant], className)} {...props} />;
});
Section.displayName = "Section";

export { Section };
