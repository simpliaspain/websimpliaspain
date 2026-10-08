// The fixed header's height: in-page jumps land below it, not under it.
const NAVBAR_HEIGHT = 80;

/**
 * The one in-page jump on the site (the hero's technology logos, the logo
 * strip's "Ver en acción").
 *
 *   start   the element's top just below the header
 *   center  the element centred in the space below the header (falls back
 *           to start when it is taller than that space)
 *
 * Smooth unless the visitor prefers reduced motion, then instant; an
 * explicit behavior wins over the page's `scroll-behavior: smooth`. Focus
 * moves to the target without scrolling again, so keyboard users continue
 * from where they landed.
 */
export function scrollToElement(el: HTMLElement, align: "start" | "center" = "start") {
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY - NAVBAR_HEIGHT;
  const room = window.innerHeight - NAVBAR_HEIGHT;
  const offset = align === "center" ? Math.max(0, (room - rect.height) / 2) : 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, top - offset), behavior: reduce ? "instant" : "smooth" });

  if (!el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.classList.add("outline-none");
  }
  el.focus({ preventScroll: true });
}
