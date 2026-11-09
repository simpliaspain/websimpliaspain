import { useState } from "react";
import { CallLink, DemoLink, type Lugar } from "@/components/DemoLinks";
import { WatchButton } from "@/components/HomeButtons";
import { cn } from "@/lib/utils";

/**
 * The site's two actions, side by side, with only one of them blue at a
 * time - and it is always the one the pointer is on.
 *
 * "Pruébalo con tu web" is blue at rest, because it is what the page is
 * asking for. Reach for the second button and the first hands the blue over
 * for as long as you are there, then takes it back. Two solid blue buttons
 * side by side would be the page asking for two things at once, and neither
 * would read as the answer.
 *
 * It is the `quiet` state the demo button already has, so the swap is the
 * colour transition both shapes already carry: nothing new moves. Focus
 * does what the pointer does, so it reads the same from the keyboard.
 *
 * Every pair on the site comes from here. There were three - the hero, the
 * closing band, and the WhatsApp page - and the first one had this
 * behaviour while the other two did not, which is exactly the kind of thing
 * that happens when a behaviour lives in the page that first needed it.
 */
export function ActionPair({
  lugar,
  secondary = "call",
  className,
  buttonClassName,
}: {
  lugar: Lugar;
  /** `call` books the 15 minutes; `watch` jumps to the clip. */
  secondary?: "call" | "watch";
  /** The row. */
  className?: string;
  /** Both buttons, for a page that sets its own height. */
  buttonClassName?: string;
}) {
  const [secondaryWanted, setSecondaryWanted] = useState(false);
  const hand = {
    onPointerEnter: () => setSecondaryWanted(true),
    onPointerLeave: () => setSecondaryWanted(false),
    onFocus: () => setSecondaryWanted(true),
    onBlur: () => setSecondaryWanted(false),
  };

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <DemoLink lugar={lugar} quiet={secondaryWanted} className={buttonClassName} />
      {secondary === "watch" ? (
        <WatchButton {...hand} className={buttonClassName} />
      ) : (
        <CallLink lugar={lugar} {...hand} className={buttonClassName} />
      )}
    </div>
  );
}
