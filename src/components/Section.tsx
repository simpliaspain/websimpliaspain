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
 *   default  py-24 md:py-32  - the rhythm most sections already used
 *                              (gap between two default sections: 192px
 *                              mobile / 256px md+)
 *   tight    py-16           - strip-like companion sections that belong to
 *                              the section before them (the logo marquee)
 *   hero     pt-20, no bottom padding - the hero is min-h-screen and sits
 *                              under the fixed header; its height is the
 *                              viewport, not the rhythm
 */
const VARIANTS = {
  default: "py-24 md:py-32",
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
