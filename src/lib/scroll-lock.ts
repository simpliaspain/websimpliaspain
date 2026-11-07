/**
 * Reference-counted body scroll lock.
 *
 * Two independent overlays can be open at once (the main menu and the chatbot
 * widget). When each managed the body styles itself, the second one to lock
 * captured the first one's locked styles as its "original" and restored those
 * on release, leaving the body permanently `position: fixed; overflow: hidden`
 * and the scroll position lost. Counting the locks and only touching the body
 * on the first acquire / last release removes that whole class of bug.
 *
 * The lock writes its declarations with the `!important` priority. Radix
 * dialogs (react-remove-scroll-bar) inject a stylesheet rule
 * `body[data-scroll-locked] { position: relative !important }` while open;
 * without the priority that rule beat the inline `position: fixed`, the body
 * stayed in flow and the `top: -scrollY` offset was applied *on top of* the
 * real scroll position - the page appeared to jump by the scroll amount on
 * open and back on close. An inline declaration marked important wins over
 * every stylesheet rule, important or not.
 *
 * While the lock holds, the page's own content width is published as
 * `--page-width` on the root element. Taking the scrollbar away can widen the
 * viewport, and an overlay laid out against the viewport - the menu panel -
 * then centres its container half a scrollbar to the right of the header it
 * is covering, which is visible as the whole header sliding sideways on open.
 * Such an overlay closes the gap with
 *
 *     padding-right: max(0px, 100% - var(--page-width, 100%))
 *
 * which is the difference between its own width and the page's, so it is
 * correct whether or not this browser widened the viewport at all, and zero
 * when nothing is locked.
 */

const PROPS = ["position", "top", "left", "right", "width", "height", "overflow", "padding-right"] as const;
type Prop = (typeof PROPS)[number];
type SavedStyles = Record<Prop, { value: string; priority: string }>;

/** The page's content width, published on the root while the lock holds. */
export const PAGE_WIDTH = "--page-width";

let lockCount = 0;
let saved: SavedStyles | null = null;
let savedScrollY = 0;

function setImportant(prop: Prop, value: string) {
  document.body.style.setProperty(prop, value, "important");
}

export function lockBodyScroll(): void {
  lockCount += 1;
  if (lockCount > 1) return;

  const { body } = document;
  savedScrollY = window.scrollY;
  // Measured before anything moves: this is the width the page is laid out
  // in, and the width every overlay on top of it has to agree with.
  const pageWidth = body.clientWidth;

  saved = Object.fromEntries(
    PROPS.map((p) => [p, { value: body.style.getPropertyValue(p), priority: body.style.getPropertyPriority(p) }]),
  ) as SavedStyles;

  setImportant("position", "fixed");
  setImportant("top", `-${savedScrollY}px`);
  setImportant("left", "0");
  setImportant("right", "0");
  setImportant("width", "100%");
  setImportant("height", "100%");
  // Safe because `html` carries `overflow-y: scroll`: the body's overflow
  // only propagates to the viewport while the root's is `visible`, and if it
  // did it would cancel the reserved scrollbar column and let the white page
  // widen into it the moment the menu opens - nothing moving, but the whole
  // surface growing, which the eye reads as a lurch to the right.
  setImportant("overflow", "hidden");
  document.documentElement.style.setProperty(PAGE_WIDTH, `${pageWidth}px`);
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;
  if (!saved) return;

  const { body } = document;
  for (const p of PROPS) {
    const { value, priority } = saved[p];
    if (value) body.style.setProperty(p, value, priority);
    else body.style.removeProperty(p);
  }
  saved = null;
  document.documentElement.style.removeProperty(PAGE_WIDTH);
  // Instant, not smooth: the page sets scroll-behavior: smooth, which would
  // otherwise animate the restore and make the page glide back on close.
  window.scrollTo({ top: savedScrollY, behavior: "instant" });
}
