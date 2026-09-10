import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on client-side navigation only. The page is prerendered,
 * so it is visible - and scrollable - before the bundle hydrates; scrolling on
 * mount would yank a visitor who has already started reading back to the top
 * (and undo the browser's own back/forward scroll restoration).
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
