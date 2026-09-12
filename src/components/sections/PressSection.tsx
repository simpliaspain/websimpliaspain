import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import photo720 from "@/assets/press/ondacero-entrevista-720.jpg";
import photo1440 from "@/assets/press/ondacero-entrevista-1440.jpg";

/**
 * Third-party coverage, verified links only. Outlet names are proper nouns and
 * the quoted headline is the outlet's own wording, so neither is translated;
 * everything else (labels, dates, alt, caption) goes through i18n. The same
 * three items are described to crawlers in the Organization JSON-LD
 * (index.html, `subjectOf`); keep both in step.
 *
 * The photograph is used exactly as supplied (full frame, overlays intact),
 * exported at 720 and 1440 px wide for the ~600 px column it renders in.
 */
const YOUTUBE = "https://www.youtube.com/watch?v=wOunqxmnvKY";
const ARTICLE =
  "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html";
const SPOTIFY = "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf";
const IVOOX = "https://go.ivoox.com/rf/175866987";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 -ml-2 font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

function OutLink({ href, label, newTab }: { href: string; label: string; newTab: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={linkClass}>
      {label}
      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{newTab}</span>
    </a>
  );
}

export function PressSection() {
  const { t } = useLanguage();
  const newTab = t("nav.opensNewTab");

  const items = [
    {
      name: "Onda Cero Madrid Norte",
      meta: `${t("press.medium.radio")} · ${t("press.date.ondacero")}`,
      links: [{ href: YOUTUBE, label: t("press.action.watch") }],
    },
    {
      name: "Madrid Norte 24 horas",
      meta: `${t("press.medium.digital")} · ${t("press.date.mn24")}`,
      links: [{ href: ARTICLE, label: t("press.action.read") }],
    },
    {
      // One episode on two platforms: one item, two links.
      name: "esRadio",
      meta: t("press.medium.radio"),
      links: [
        { href: SPOTIFY, label: t("press.action.listenSpotify") },
        { href: IVOOX, label: t("press.action.listenIvoox") },
      ],
    },
  ];

  return (
    <section aria-labelledby="press-heading" className="bg-background py-20 md:py-24">
      <div className="container">
        <h2
          id="press-heading"
          className="mb-10 text-center text-3xl font-bold text-foreground md:mb-14 md:text-4xl"
        >
          {t("press.heading")}
        </h2>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Photo first in DOM: it leads on mobile and sits left on lg. Below
              the fold on every viewport (the hero is min-h-screen), so lazy -
              but Chromium's lazy lookahead still fetches it during the initial
              load on phones, where it competed with CSS/JS for bandwidth and
              cost ~150 ms of LCP on a throttled profile. fetchpriority=low
              keeps it behind the critical resources, and the sizes value is
              the real rendered width (container minus 2x24px padding), so a
              390px@2x phone gets the 40 KB 720 file, not the 97 KB 1440 one. */}
          <figure className="m-0">
            <img
              src={photo720}
              srcSet={`${photo720} 720w, ${photo1440} 1440w`}
              sizes="(min-width: 1024px) 592px, (min-width: 768px) 720px, calc(100vw - 48px)"
              width={1440}
              height={810}
              alt={t("press.photoAlt")}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="aspect-video w-full rounded-3xl border border-border object-cover"
            />
            <figcaption className="mt-3 text-sm text-muted-foreground">{t("press.caption")}</figcaption>
          </figure>

          <div>
            <blockquote className="border-l-4 border-primary/40 pl-5">
              <p className="text-xl font-semibold leading-snug text-foreground md:text-2xl">
                &ldquo;{t("press.quote")}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-muted-foreground">
                <OutLink href={ARTICLE} label={t("press.quoteSource")} newTab={newTab} />
              </footer>
            </blockquote>

            <ul className="mt-8 divide-y divide-border border-t border-border">
              {items.map((item) => (
                <li key={item.name} className="py-4">
                  <p className="text-lg font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.meta}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4">
                    {item.links.map((l) => (
                      <OutLink key={l.href} href={l.href} label={l.label} newTab={newTab} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
