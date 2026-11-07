import { useId, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Photo } from "@/components/Photo";
import { hasPhoto } from "@/lib/photos";
import { cn } from "@/lib/utils";

/**
 * Coverage reduced to one sentence (redesign, 05/11/2026). The outlet names
 * are proper nouns and are not translated; only the sentence around them is.
 * It used to be a section of its own with a photograph and the outlet's
 * headline - that version still lives in PressSection, which the inner pages
 * use. The same appearances are described to crawlers in the Organization
 * JSON-LD (index.html, `subjectOf`); keep both in step.
 *
 * Each outlet can carry a photograph of the appearance, shown on hover and on
 * keyboard focus (06/11/2026). `photo` names a file in src/assets/photos; an
 * outlet whose file is not there yet is simply a link, with no empty frame
 * and no card that opens onto nothing.
 */
type Outlet = {
  name: string;
  href: string;
  /** Stem of the file in src/assets/photos, if there is one. */
  photo?: string;
  /** Whose photograph it is and who took it, shown under the picture. */
  creditKey?: string;
  /** A mark is fitted inside the frame; a photograph fills it. */
  mark?: boolean;
};

const OUTLETS: Record<"esRadio" | "madridNorte" | "instituto", Outlet> = {
  esRadio: {
    name: "esRadio",
    href: "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf",
    photo: "esradio",
    creditKey: "press.creditEsRadio",
    mark: true,
  },
  madridNorte: {
    name: "Madrid Norte 24 horas",
    href: "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html",
    photo: "madridnorte24h",
    creditKey: "press.creditMN24",
  },
  instituto: {
    name: "Instituto de Emprendimiento Avanzado",
    href: "https://ieavanzado.com/martes-del-emprendimiento/",
    photo: "ieavanzado",
    creditKey: "press.creditIEA",
  },
};

/** Kept clear of the page's edges when the card is pulled back inside. */
const EDGE_PAD = 12;

function PressLink({ outlet }: { outlet: Outlet }) {
  const { t } = useLanguage();
  const [showing, setShowing] = useState(false);
  // Not in the document until it is first asked for. Centred on its link it
  // can hang off the side of the page, and a hidden box still counts towards
  // how wide the document is - which on a narrow screen is real horizontal
  // scroll caused by decoration nobody has asked to see. Once it has been
  // shown it stays, carrying the offset that put it inside.
  const [mounted, setMounted] = useState(false);
  const [nudge, setNudge] = useState(0);
  const cardRef = useRef<HTMLSpanElement | null>(null);
  const id = useId();
  const picture = outlet.photo && hasPhoto(outlet.photo) ? outlet.photo : undefined;

  /**
   * Centred on its link, a card beside the first or the last outlet hangs off
   * the side of the page - which on a narrow screen is real horizontal
   * scroll, even though the card is only decoration. This measures how far
   * over the edge it would go and pulls it back by exactly that much, so it
   * still sits as close to its link as the page allows.
   */
  const place = () => {
    const card = cardRef.current;
    if (!card) return;
    const previous = card.style.transform;
    card.style.transform = "translate(-50%, 0)";
    const box = card.getBoundingClientRect();
    card.style.transform = previous;
    const page = document.documentElement.clientWidth;
    const over = Math.max(0, box.right - (page - EDGE_PAD));
    const under = Math.max(0, EDGE_PAD - box.left);
    setNudge(Math.round(under - over));
  };

  const show = () => {
    setMounted(true);
    // One frame for it to exist, then measure it and bring it in.
    requestAnimationFrame(() => {
      place();
      setShowing(true);
    });
  };

  const anchor = (
    <a
      href={outlet.href}
      target="_blank"
      rel="noopener"
      className="text-link underline underline-offset-2 hover:decoration-2"
      data-umami-event="prensa"
      data-umami-event-medio={outlet.name}
      aria-describedby={picture && mounted && showing ? id : undefined}
      onFocus={show}
      onBlur={() => setShowing(false)}
    >
      {outlet.name}
      <span className="sr-only"> {t("nav.opensNewTab")}</span>
    </a>
  );

  if (!picture) return anchor;

  return (
    <span
      className="relative inline-block"
      onPointerEnter={(event) => event.pointerType === "mouse" && show()}
      onPointerLeave={() => setShowing(false)}
    >
      {anchor}
      {mounted && (
      <>
      {/* Above the link and centred on it, pulled back inside the page when
          that would hang it off the edge. aria-hidden while closed so the
          caption is not read out of nowhere; pointer-events none so it can
          never sit between the reader and the link they are aiming for. */}
      <span
        ref={cardRef}
        id={id}
        role="group"
        aria-hidden={!showing}
        className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-30 w-[min(19rem,70vw)] -translate-x-1/2 overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_18px_40px_-24px_hsl(220_20%_6%/0.45)] transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
        style={{
          opacity: showing ? 1 : 0,
          transform: `translate(calc(-50% + ${nudge}px), ${showing ? "0" : "6px"})`,
          visibility: showing ? "visible" : "hidden",
        }}
      >
        {/* A mark is fitted inside the frame with air around it; cropped to
            fill, a logo loses its own margins and usually a letter too. And
            it sits on white, not on the soft grey a photograph sits on: a
            logo file carries its own white ground, and on grey that ground
            shows as a box around it. */}
        <span className={cn("block aspect-[16/9]", outlet.mark ? "grid place-items-center bg-card px-7 py-5" : "bg-secondary")}>
          <Photo
            name={picture}
            alt={t(outlet.creditKey ?? "press.photoAlt")}
            width={outlet.mark ? 900 : 1440}
            height={outlet.mark ? 304 : 810}
            className={outlet.mark ? "h-auto max-h-full w-full object-contain" : undefined}
          />
        </span>
        {outlet.creditKey && (
          <span className="block px-3.5 py-2.5 text-[13px] leading-snug text-muted-foreground">
            {t(outlet.creditKey)}
          </span>
        )}
      </span>
      </>
      )}
    </span>
  );
}

export function PressLine() {
  const { t } = useLanguage();

  return (
    <p className="m-0 max-w-[64ch]">
      {t("press.line")} <PressLink outlet={OUTLETS.esRadio} />, <PressLink outlet={OUTLETS.madridNorte} />{" "}
      {t("press.and")} <PressLink outlet={OUTLETS.instituto} />.
    </p>
  );
}
