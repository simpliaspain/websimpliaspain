import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** How far it rises. Small enough that nothing appears to move house. */
const RISE_PX = 14;
const DURATION_MS = 560;
/** The redesign's own easing: quick to leave, slow to settle. */
const EASING = "cubic-bezier(0.22, 0.61, 0.36, 1)";
/**
 * Only things below this line are hidden to begin with. Anything already on
 * screen when the page settles is left alone: hiding it and bringing it back
 * is a flinch on arrival, and the first screen is the one that must be
 * instant.
 */
const BELOW_THE_FOLD = 0.92;
/** Armed a little before it is reached, so it is never caught mid-rise. */
const MARGIN = "0px 0px -8% 0px";

/**
 * Brings a block up as it is first reached, once, and never again.
 *
 * Three things keep it honest. It renders visible, and only hides itself in a
 * layout effect - so the prerendered HTML, a crawler and a reader with no
 * JavaScript all get the page whole. It hides nothing that is already on
 * screen. And it does nothing at all under `prefers-reduced-motion`, where
 * the content is simply there.
 *
 * Only opacity and transform move, so it cannot shift the layout, and both
 * are cheap enough to stay on the compositor.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Milliseconds behind its neighbours, for a row that comes in in order. */
  delay?: number;
  as?: "div" | "li" | "section" | "figure";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight * BELOW_THE_FOLD) return;
    setHidden(true);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!hidden || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setHidden(false);
        observer.disconnect();
      },
      { rootMargin: MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hidden]);

  return (
    <Tag
      ref={ref as never}
      className={cn(className)}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? `translateY(${RISE_PX}px)` : "none",
        transition: `opacity ${DURATION_MS}ms ${EASING} ${delay}ms, transform ${DURATION_MS}ms ${EASING} ${delay}ms`,
        willChange: hidden ? "opacity, transform" : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
