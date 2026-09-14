import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import photo720 from "@/assets/press/ondacero-entrevista-720.jpg";
import photo1440 from "@/assets/press/ondacero-entrevista-1440.jpg";
import { Section } from "@/components/Section";

/**
 * Third-party coverage, verified links only. Outlet names are proper nouns and
 * the quoted headline is the outlet's own wording, so neither is translated;
 * everything else (labels, dates, alt, caption) goes through i18n. The same
 * three items are described to crawlers in the Organization JSON-LD
 * (index.html, `subjectOf`); keep both in step.
 *
 * Hierarchy: a supporting section. Heading one step below the primary
 * section headings (text-3xl/4xl/5xl elsewhere), same vertical rhythm and
 * the same max-w-5xl measure as the Benefits and Services grids. The
 * outlet's headline leads the section full-width, then the photo and the
 * list sit side by side from lg, tops aligned; below lg the photo comes
 * first.
 *
 * The photograph is used exactly as supplied (full frame, overlays intact),
 * exported at 720 and 1440 px wide for the ~470 px column it renders in.
 */
const YOUTUBE = "https://www.youtube.com/watch?v=wOunqxmnvKY";
const ARTICLE =
  "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html";
const SPOTIFY = "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf";
const IVOOX = "https://go.ivoox.com/rf/175866987";

// One treatment for every outbound link in the section: same size, weight,
// colour, icon and hit area, whether an item has one link or two.
const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 -ml-2 text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

function OutLink({ href, label, newTab }: { href: string; label: string; newTab: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={linkClass}>
      {label}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{newTab}</span>
    </a>
  );
}

// The muted "medium · date" line and the photo caption share this style.
const metaClass = "text-sm text-muted-foreground";

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
      // One episode on two platforms: one item, two links, same treatment.
      name: "esRadio",
      meta: t("press.medium.radio"),
      links: [
        { href: SPOTIFY, label: t("press.action.listenSpotify") },
        { href: IVOOX, label: t("press.action.listenIvoox") },
      ],
    },
  ];

  return (
    <Section variant="default" aria-labelledby="press-heading" className="bg-background">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          {/* A real section opener, one step below the primary section
              headings (text-3xl/4xl/5xl elsewhere): the section now opens the
              closing sequence before the CTA and needs its own voice. It no
              longer matches the logo marquee's caption on purpose. */}
          <h2
            id="press-heading"
            className="text-center text-2xl font-bold text-foreground md:text-3xl lg:text-4xl"
          >
            {t("press.heading")}
          </h2>

          {/* The outlet's own headline leads the section, full measure, so the
              strongest line is read first and the photo + list below read as
              its evidence rather than as a column competing with a quote. */}
          <blockquote className="mx-auto mt-10 max-w-3xl text-center">
            <p className="text-xl font-semibold leading-snug text-foreground md:text-2xl">
              &ldquo;{t("press.quote")}&rdquo;
            </p>
            <footer className={`mt-2 ${metaClass}`}>
              <OutLink href={ARTICLE} label={t("press.quoteSource")} newTab={newTab} />
            </footer>
          </blockquote>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Photo first in DOM: it leads below lg and sits left from lg,
                top-aligned with the list. Below the fold on every viewport, so
                lazy + low priority; sizes is the real rendered width so phones
                get the 720 file. */}
            <figure className="m-0">
              <img
                src={photo720}
                srcSet={`${photo720} 720w, ${photo1440} 1440w`}
                sizes="(min-width: 1024px) 488px, (min-width: 768px) 720px, calc(100vw - 48px)"
                width={1440}
                height={810}
                alt={t("press.photoAlt")}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="aspect-video w-full rounded-3xl border-2 border-border object-cover"
              />
              <figcaption className={`mt-3 ${metaClass}`}>{t("press.caption")}</figcaption>
            </figure>

            <ul className="divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.name}</p>
                    <p className={metaClass}>{item.meta}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-3 sm:shrink-0 sm:justify-end">
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
    </Section>
  );
}
