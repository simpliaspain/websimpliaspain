/**
 * Reference-counted body scroll lock.
 *
 * Two independent overlays can be open at once (the main menu and the chatbot
 * widget). When each managed the body styles itself, the second one to lock
 * captured the first one's locked styles as its "original" and restored those
 * on release, leaving the body permanently `position: fixed; overflow: hidden`
 * and the scroll position lost. Counting the locks and only touching the body
 * on the first acquire / last release removes that whole class of bug.
 */

type SavedStyles = {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  height: string;
  overflow: string;
  paddingRight: string;
};

let lockCount = 0;
let saved: SavedStyles | null = null;
let savedScrollY = 0;

export function lockBodyScroll(): void {
  lockCount += 1;
  if (lockCount > 1) return;

  const { body } = document;
  savedScrollY = window.scrollY;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  saved = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    height: body.style.height,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.height = "100%";
  body.style.overflow = "hidden";
  // Compensate for the scrollbar so the page does not shift horizontally.
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;
  if (!saved) return;

  Object.assign(document.body.style, saved);
  saved = null;
  window.scrollTo(0, savedScrollY);
}
