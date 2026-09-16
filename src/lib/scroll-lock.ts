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
 */

const PROPS = ["position", "top", "left", "right", "width", "height", "overflow", "padding-right"] as const;
type Prop = (typeof PROPS)[number];
type SavedStyles = Record<Prop, { value: string; priority: string }>;

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
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  saved = Object.fromEntries(
    PROPS.map((p) => [p, { value: body.style.getPropertyValue(p), priority: body.style.getPropertyPriority(p) }]),
  ) as SavedStyles;

  setImportant("position", "fixed");
  setImportant("top", `-${savedScrollY}px`);
  setImportant("left", "0");
  setImportant("right", "0");
  setImportant("width", "100%");
  setImportant("height", "100%");
  setImportant("overflow", "hidden");
  // Compensate for the scrollbar so the page does not shift horizontally.
  if (scrollbarWidth > 0) setImportant("padding-right", `${scrollbarWidth}px`);
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
  // Instant, not smooth: the page sets scroll-behavior: smooth, which would
  // otherwise animate the restore and make the page glide back on close.
  window.scrollTo({ top: savedScrollY, behavior: "instant" });
}
