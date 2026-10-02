import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scrolls to the top on client-side navigation only. The page is prerendered,
 * so it is visible - and scrollable - before the bundle hydrates; scrolling on
 * mount would yank a visitor who has already started reading back to the top
 * (and undo the browser's own back/forward scroll restoration).
 *
 * A link to the page already open (the footer logo on /, "Contacto" on
 * /contacto) is a navigation too: react-router gives it a new location key
 * but the same pathname, and it used to do nothing at all - from the footer
 * the reader was left at the bottom. It now goes to the top. Back/forward
 * (POP) and in-page anchors (#faq) keep their own scroll.
 */
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const last = useRef({ pathname, key });

  useEffect(() => {
    const previous = last.current;
    last.current = { pathname, key };
    if (previous.key === key) return;
    if (previous.pathname !== pathname) {
      window.scrollTo(0, 0);
    } else if (!hash && navigationType !== "POP") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, hash, key, navigationType]);

  return null;
}
