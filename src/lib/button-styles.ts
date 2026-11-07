/**
 * The redesign has exactly two button shapes and every page uses these, so
 * the sizes cannot drift: 56px tall, an 8px corner, 18px semibold label, no
 * icon and no arrow. A solid blue one for the one action a page is asking
 * for, and an outlined one beside it for the alternative.
 *
 * They live here rather than as variants of the shadcn Button because that
 * component is still used by the forms and the dialogs, where its own sizes
 * are right.
 */
/**
 * How they answer the pointer, which is the same for both: they come up a
 * pixel, take a shadow the colour of the blue they are made of - so it reads
 * as the button lifting off the page rather than as a grey drop shadow - and
 * on press they go back down and in. 180ms out, 90ms back: a press should
 * feel quicker than a hover, or it feels sticky.
 *
 * Under `prefers-reduced-motion` the colours still change and nothing moves.
 */
const BASE =
  "inline-flex min-h-[56px] items-center justify-center gap-3 rounded-md px-[26px] text-[18px] font-semibold no-underline " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out " +
  "hover:-translate-y-px active:translate-y-0 active:scale-[0.97] active:duration-[90ms] " +
  "motion-reduce:transition-[background-color,border-color,color] motion-reduce:hover:translate-y-0 " +
  "motion-reduce:active:scale-100";

/** The blue it lifts into, and the shadow it casts, both from the brand. */
const LIFT = "hover:shadow-[0_8px_20px_-8px_hsl(210_100%_32%/0.55)] active:shadow-none";

export const PRIMARY = `${BASE} ${LIFT} bg-primary text-primary-foreground hover:bg-[hsl(210_100%_38%)]`;

/**
 * The alternative: an outline at rest that fills with the same blue when it
 * is reached. It used to do no more than darken its own border, which read
 * as a button that was only half available.
 */
export const OUTLINE =
  `${BASE} ${LIFT} border border-[hsl(216_5%_57%)] bg-transparent text-foreground ` +
  "hover:border-primary hover:bg-primary hover:text-primary-foreground";
