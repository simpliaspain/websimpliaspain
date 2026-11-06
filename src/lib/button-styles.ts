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
const BASE =
  "inline-flex min-h-[56px] items-center justify-center gap-3 rounded-md px-[26px] text-[18px] font-semibold no-underline transition-colors duration-150 motion-reduce:transition-none";

export const PRIMARY = `${BASE} bg-primary text-primary-foreground hover:bg-[hsl(210_100%_36%)] active:scale-[0.97] motion-reduce:active:scale-100`;

export const OUTLINE = `${BASE} border border-[hsl(216_5%_57%)] text-foreground hover:border-foreground`;
