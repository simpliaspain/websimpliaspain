import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Coverage reduced to one sentence (redesign, 05/11/2026). The outlet names
 * are proper nouns and are not translated; only the sentence around them is.
 * It used to be a section of its own with a photograph and the outlet's
 * headline - that version still lives in PressSection, which the inner pages
 * use. The same appearances are described to crawlers in the Organization
 * JSON-LD (index.html, `subjectOf`); keep both in step.
 */
const OUTLETS: ReadonlyArray<readonly [string, string]> = [
  ["esRadio", "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf"],
  [
    "Madrid Norte 24 horas",
    "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html",
  ],
  ["Instituto de Empresa Avanzado", "https://ieavanzado.com/martes-del-emprendimiento/"],
];

export function PressLine() {
  const { t } = useLanguage();
  const [esRadio, madridNorte, instituto] = OUTLETS;

  const link = (outlet: readonly [string, string]) => (
    <a
      href={outlet[1]}
      target="_blank"
      rel="noopener"
      className="text-link underline underline-offset-2"
      data-umami-event="prensa"
      data-umami-event-medio={outlet[0]}
    >
      {outlet[0]}
      <span className="sr-only"> {t("nav.opensNewTab")}</span>
    </a>
  );

  return (
    <p className="m-0">
      {t("press.line")} {link(esRadio)}, {link(madridNorte)} {t("press.and")} {link(instituto)}.
    </p>
  );
}
