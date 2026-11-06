import { photoUrl } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * A photograph that renders only if the file is actually there; see
 * src/lib/photos.ts for where they come from and how they are named. A
 * caller that needs to know in advance asks `hasPhoto` from there.
 */
export function Photo({
  name,
  alt,
  width,
  height,
  className,
  sizes,
  eager = false,
}: {
  name: string;
  alt: string;
  /** The intrinsic size, so the box is reserved before the file loads. */
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  /** Only for a photograph above the fold; everything else stays lazy. */
  eager?: boolean;
}) {
  const src = photoUrl(name);
  if (!src) return null;

  const retina = photoUrl(name, "@2x");

  return (
    <img
      src={src}
      srcSet={retina ? `${src} 1x, ${retina} 2x` : undefined}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("block h-full w-full object-cover", className)}
    />
  );
}
