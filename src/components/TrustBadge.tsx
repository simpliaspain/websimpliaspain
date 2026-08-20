import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface TrustBadgeProps extends HTMLAttributes<HTMLElement> {
  /** Render as the child element (a link or a button) rather than a div. */
  asChild?: boolean;
  children: ReactNode;
}

/**
 * Shared shell for the hero trust badges.
 *
 * It owns radius, border, background, shadow, padding, minimum height, width
 * behaviour and the hover treatment, so the pair always reads as one matched
 * component. Instances supply content only - deliberately no `className` prop,
 * so no instance can drift on padding, radius, shadow or width.
 */
const TrustBadge = forwardRef<HTMLElement, TrustBadgeProps>(
  ({ asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref as React.Ref<never>}
        className={cn(
          "group flex min-h-[4rem] w-full flex-1 items-center justify-center gap-3",
          "rounded-full border border-border bg-card px-5 py-3 text-center text-foreground shadow-sm",
          "transition-all hover:border-primary/30 hover:shadow-md motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "sm:max-w-[20rem]",
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
TrustBadge.displayName = "TrustBadge";

export default TrustBadge;
