import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import photo720 from "@/assets/press/ondacero-entrevista-720.jpg";
import photo1440 from "@/assets/press/ondacero-entrevista-1440.jpg";
import logoMn1x from "@/assets/press/logo-mn24h-1x.png";
import logoMn2x from "@/assets/press/logo-mn24h-2x.png";
import logoEs1x from "@/assets/press/logo-esradio-1x.png";
import logoEs2x from "@/assets/press/logo-esradio-2x.png";
import { Section } from "@/components/Section";

/**
 * Third-party coverage, verified links only. Outlet names are proper nouns and
 * the quoted headline is the outlet's own wording, so neither is translated;
 * everything else (labels, dates, alt, caption) goes through i18n. The same
 * three items are described to crawlers in the Organization JSON-LD
 * (index.html, `subjectOf`); keep both in step.
 *
 * Compact by design: a caption, one row of outlet links and the outlet's
 * headline as a single quoted line. The photograph (used exactly as
 * supplied, uncropped 16:9, 720/1440 px files) is a thumbnail inside the
 * Onda Cero link - it documents that interview.
 */
const YOUTUBE = "https://www.youtube.com/watch?v=wOunqxmnvKY";
const ARTICLE =
  "https://www.madridnorte24horas.com/articulo/tendencias/simplia-startup-espanola-que-impulsa-agentes-telefonicos-inteligencia-artificial-empresas/20260621100037129472.html";
const SPOTIFY = "https://open.spotify.com/episode/18D90WvJn5pAct1zdtcEHf";
const IVOOX = "https://go.ivoox.com/rf/175866987";

// One treatment for every outbound link in the section: same size, weight,
// colour, icon and hit area, whether an item has one link or two.
const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 underline decoration-border underline-offset-4 transition-colors hover:decoration-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

function OutLink({ href, label, newTab, muted = false, inline = false }: { href: string; label: string; newTab: string; muted?: boolean; inline?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`${linkClass} ${muted ? "text-sm text-muted-foreground" : "font-semibold text-foreground"} ${inline ? "align-middle" : ""}`}
    >
      {label}
      <ExternalLink className={`${muted ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 text-muted-foreground`} aria-hidden="true" />
      <span className="sr-only">{newTab}</span>
    </a>
  );
}

// One treatment for the caption and the quote line: the marquee caption's.
const captionClass = "text-sm font-medium text-muted-foreground";

// One tile for every outlet visual: 96x54 on phones, 128x72 from md, same
// radius and border, so the row reads as a set. The photograph fills its tile
// (object-cover); the two logos are contained on a white surface with their
// own padding, never stretched or cropped.
//
// Alt text: the two LOGOS are decorative (alt="") - a mark beside the
// outlet's own name adds nothing a screen reader needs, and the link's
// accessible name stays the outlet name. The PHOTOGRAPH is content: it
// documents that the interview happened, so it carries an alt describing
// the scene (not the outlet, which the link text already says).
const tileClass = "h-[54px] w-24 shrink-0 rounded-xl border border-border md:h-[72px] md:w-32";
// bg-primary-foreground is white in both palettes: a logo's own white keeps
// dark marks visible against the dark theme without inverting the mark.
const logoTileClass = `${tileClass} flex items-center justify-center overflow-hidden bg-primary-foreground`;
const lowPriority = { fetchpriority: "low" } as Record<string, string>;
const imgCommon = { loading: "lazy" as const, decoding: "async" as const, ...lowPriority };
const decorative = { alt: "", ...imgCommon };

export function PressSection() {
  const { t } = useLanguage();
  const newTab = t("nav.opensNewTab");

  return (
    <Section variant="default" aria-labelledby="press-heading" className="bg-background">
      <div className="container">
        {/* Compact: a caption, one row of outlet links, one quoted line. The
            heading stays an h2 (aria-labelledby, outline) but looks like the
            logo marquee's caption - both label a strip of social proof. */}
        <h2 id="press-heading" className={`mb-8 text-center ${captionClass}`}>
          {t("press.heading")}
        </h2>

        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {/* Onda Cero: the interview photograph fills its tile. sizes matches
              the tile so the 720 file is fetched, never the 1440. */}
          <li>
            <a href={YOUTUBE} target="_blank" rel="noopener" className={`${linkClass} gap-3 font-semibold text-foreground`}>
              <img
                src={photo720}
                srcSet={`${photo720} 720w, ${photo1440} 1440w`}
                sizes="(min-width: 768px) 128px, 96px"
                width={1440}
                height={810}
                alt={t("press.photoAlt")}
                {...imgCommon}
                className={`${tileClass} object-cover`}
              />
              <span>Onda Cero Madrid Norte</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{newTab}</span>
            </a>
          </li>
          {/* Madrid Norte 24h: a square mark, contained at 78% of the tile
              height (56 of 72px). */}
          <li>
            <a href={ARTICLE} target="_blank" rel="noopener" className={`${linkClass} gap-3 font-semibold text-foreground`}>
              <span className={logoTileClass}>
                <img
                  src={logoMn1x}
                  srcSet={`${logoMn1x} 1x, ${logoMn2x} 2x`}
                  width={54}
                  height={56}
                  {...decorative}
                  className="h-[42px] w-auto md:h-14"
                />
              </span>
              <span>Madrid Norte 24 horas</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{newTab}</span>
            </a>
          </li>
          {/* esRadio: a wide, short mark. Contained by width at 78% of the
              tile (100 of 128px) rather than by height, so its ink area is
              about the same as the square mark's and the two read at one
              weight. One episode on two platforms: one item, two links; the
              logo goes with the primary (Spotify) link. */}
          <li className="flex flex-wrap items-center justify-center gap-x-1">
            <a href={SPOTIFY} target="_blank" rel="noopener" className={`${linkClass} gap-3 font-semibold text-foreground`}>
              <span className={logoTileClass}>
                <img
                  src={logoEs1x}
                  srcSet={`${logoEs1x} 1x, ${logoEs2x} 2x`}
                  width={100}
                  height={33}
                  {...decorative}
                  className="h-auto w-[75px] md:w-[100px]"
                />
              </span>
              <span>esRadio</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{newTab}</span>
            </a>
            {/* Kept together so the separator never ends a line on phones. */}
            <span className="inline-flex items-center gap-x-1">
              <span aria-hidden="true" className="text-muted-foreground">·</span>
              <OutLink href={IVOOX} label="iVoox" newTab={newTab} muted />
            </span>
          </li>
        </ul>

        {/* The outlet's own headline, one muted line: a third party describing
            the business, kept for readers, search and LLMs. */}
        <blockquote className={`mx-auto mt-6 max-w-3xl text-center ${captionClass}`}>
          <p>
            &ldquo;{t("press.quote")}&rdquo;{" "}
            <OutLink href={ARTICLE} label={t("press.quoteSource")} newTab={newTab} muted inline />
          </p>
        </blockquote>
      </div>
    </Section>
  );
}
