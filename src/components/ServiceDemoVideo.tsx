import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ServiceDemoVideoProps {
  src: string;
  poster: string;
  /** Intrinsic size of the encode; the box is always this ratio. */
  width: number;
  height: number;
  labelKey: string;
  className?: string;
}

/**
 * The product demo: plays in place, muted and looping, with our own
 * play/pause control instead of browser chrome.
 *
 * Nothing is fetched on page load. The poster is attached when the block
 * comes within 800px of the viewport; the video's source is attached (and
 * only then requested) once a quarter of the block is on screen, so a
 * reader who never scrolls here pays nothing. Off screen it pauses, and it
 * resumes on return unless the reader paused it.
 *
 * No autoplay under prefers-reduced-motion (WCAG 2.3.3) or the Save-Data
 * hint: the poster stays with the play control, and the video is fetched
 * only if the reader presses play. The control is always visible and
 * keyboard operable (WCAG 2.2.2: motion over 5s needs a pause). If the
 * browser blocks autoplay, play() rejects, the control shows "play" and the
 * poster stays up - the box is never a black rectangle.
 */
export function ServiceDemoVideo({ src, poster, width, height, labelKey, className }: ServiceDemoVideoProps) {
  const { t } = useLanguage();
  const figureRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [attached, setAttached] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  // Set by the reader's own pause, so scrolling back does not override it.
  const userPaused = useRef(false);
  const playWhenAttached = useRef(false);

  // A rejected play() (autoplay blocked, or interrupted by a pause) means
  // the element did not start; mirror what it actually is rather than
  // assuming, so the control's label can never disagree with playback.
  const syncFromElement = () => setPlaying(!(videoRef.current?.paused ?? true));

  const play = () => {
    if (!attached) {
      playWhenAttached.current = true;
      setAttached(true);
      return;
    }
    videoRef.current?.play().catch(syncFromElement);
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const allowed = !reduce && !saveData;
    setAutoplay(allowed);

    const figure = figureRef.current;
    if (!figure || !("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    // Observer callbacks can carry several entries for the same element when
    // the main thread is busy (scrolled out and back before the callback
    // ran). Only the last one is the current state; acting on the first
    // paused a video that was back in view - right after the reader pressed
    // play - which is what VIDEO-2 caught about 1 run in 10.
    const latest = (entries: IntersectionObserverEntry[]) => entries[entries.length - 1];
    const nearObserver = new IntersectionObserver(
      (entries) => {
        if (latest(entries).isIntersecting) {
          setNear(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    const viewObserver = new IntersectionObserver(
      (entries) => {
        const video = videoRef.current;
        if (latest(entries).isIntersecting) {
          if (allowed && !userPaused.current) {
            if (video?.currentSrc) video.play().catch(syncFromElement);
            else {
              playWhenAttached.current = true;
              setAttached(true);
            }
          }
        } else if (video && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    nearObserver.observe(figure);
    viewObserver.observe(figure);
    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  // The <source> is rendered only once attached; inserting it into an empty
  // media element starts resource selection, so play() can follow directly.
  useEffect(() => {
    const video = videoRef.current;
    if (!attached || !video || !playWhenAttached.current) return;
    playWhenAttached.current = false;
    video.muted = true;
    video.play().catch(syncFromElement);
  }, [attached]);

  // Decide from the element itself, not the React mirror, which only
  // updates when the play/pause events arrive and can lag a fast press.
  const toggle = () => {
    if (videoRef.current && !videoRef.current.paused) {
      userPaused.current = true;
      videoRef.current?.pause();
    } else {
      userPaused.current = false;
      play();
    }
  };

  return (
    // The frame is the service card's sibling: same surface, border, radius
    // and padding (16px below lg so phones keep most of the video). When the
    // row stretches it taller than the video, the 4:3 video stays whole and
    // centred - the padding absorbs the difference, nothing is cropped.
    <figure
      ref={figureRef}
      className={cn("m-0 flex items-center justify-center rounded-3xl border-2 border-border bg-card p-4 lg:p-8", className)}
    >
      <div className="relative w-full">
        {/* React sets `muted` as a property, never as the attribute, so it is
            also forced in the effect above before any play(). */}
        <video
          ref={videoRef}
          width={width}
          height={height}
          poster={near ? poster : undefined}
          autoPlay={autoplay && attached}
          muted
          loop
          playsInline
          preload="none"
          aria-label={t(labelKey)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block h-auto w-full rounded-xl bg-secondary object-contain"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {attached && <source src={src} type="video/mp4" />}
        </video>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? t("demo.pause") : t("demo.play")}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          {playing ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
    </figure>
  );
}
