import { useId, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Photo } from "@/components/Photo";
import { hasPhoto } from "@/lib/photos";

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
};

const OUTLETS: Record<"esRadio" | "madridNorte" | "instituto", Outlet> = {
  esRadio: { name: "esRadio", href: "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf" },
  madridNorte: {
    name: "Madrid Norte 24 horas",
    href: "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html",
    photo: "madridnorte24h",
    creditKey: "press.creditMN24",
  },
  instituto: { name: "Instituto de Empresa Avanzado", href: "https://ieavanzado.com/martes-del-emprendimiento/" },
};

function PressLink({ outlet }: { outlet: Outlet }) {
  const { t } = useLanguage();
  const [showing, setShowing] = useState(false);
  const id = useId();
  const picture = outlet.photo && hasPhoto(outlet.photo) ? outlet.photo : undefined;

  const anchor = (
    <a
      href={outlet.href}
      target="_blank"
      rel="noopener"
      className="text-link underline underline-offset-2 hover:decoration-2"
      data-umami-event="prensa"
      data-umami-event-medio={outlet.name}
      aria-describedby={picture && showing ? id : undefined}
      onFocus={() => setShowing(true)}
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
      onPointerEnter={(event) => event.pointerType === "mouse" && setShowing(true)}
      onPointerLeave={() => setShowing(false)}
    >
      {anchor}
      {/* Above the link and centred on it, clipped to the page by max-width
          at the small end. aria-hidden while closed so the caption is not
          read out of nowhere; pointer-events none so it can never sit
          between the reader and the link they are aiming for. */}
      <span
        id={id}
        role="group"
        aria-hidden={!showing}
        className="pointer-events-none absolute bottom-[calc(100%+12px)] left-1/2 z-30 w-[min(19rem,70vw)] -translate-x-1/2 overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_18px_40px_-24px_hsl(220_20%_6%/0.45)] transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
        style={{
          opacity: showing ? 1 : 0,
          transform: `translate(-50%, ${showing ? "0" : "6px"})`,
          visibility: showing ? "visible" : "hidden",
        }}
      >
        <span className="block aspect-[16/9] bg-secondary">
          <Photo name={picture} alt={t(outlet.creditKey ?? "press.photoAlt")} width={1440} height={810} />
        </span>
        {outlet.creditKey && (
          <span className="block px-3.5 py-2.5 text-[13px] leading-snug text-muted-foreground">
            {t(outlet.creditKey)}
          </span>
        )}
      </span>
    </span>
  );
}

export function PressLine() {
  const { t } = useLanguage();

  return (
    <p className="m-0">
      {t("press.line")} <PressLink outlet={OUTLETS.esRadio} />, <PressLink outlet={OUTLETS.madridNorte} />{" "}
      {t("press.and")} <PressLink outlet={OUTLETS.instituto} />.
    </p>
  );
}
