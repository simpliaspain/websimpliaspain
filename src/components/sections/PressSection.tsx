import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Third-party coverage, verified links only. Outlet names are text (no logo
 * assets exist for them) and are proper nouns, so they are not translated.
 * The same three items are described to crawlers in the Organization JSON-LD
 * (index.html, `subjectOf`); keep both lists in step.
 */
const PRESS = [
  {
    name: "Onda Cero Madrid Norte",
    href: "https://www.youtube.com/watch?v=wOunqxmnvKY",
  },
  {
    name: "Madrid Norte 24 horas",
    href: "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html",
  },
  {
    // One episode published on two platforms: one item, the name links to
    // Spotify and a secondary link offers iVoox.
    name: "esRadio",
    href: "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf",
    alt: { name: "iVoox", href: "https://go.ivoox.com/rf/175866987" },
  },
];

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 underline decoration-border underline-offset-4 transition-colors hover:decoration-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

export function PressSection() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="press-heading" className="bg-background pb-4 pt-12">
      <div className="container">
        <h2 id="press-heading" className="mb-2 text-center text-sm font-medium text-muted-foreground">
          {t("press.heading")}
        </h2>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          {PRESS.map((item) => (
            <li key={item.name} className="flex flex-wrap items-center justify-center">
              <a href={item.href} target="_blank" rel="noopener" className={`${linkClass} font-semibold text-foreground`}>
                {item.name}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">{t("nav.opensNewTab")}</span>
              </a>
              {item.alt && (
                <a href={item.alt.href} target="_blank" rel="noopener" className={`${linkClass} text-sm text-muted-foreground`}>
                  {t("press.alsoOn")} {item.alt.name}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{t("nav.opensNewTab")}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
