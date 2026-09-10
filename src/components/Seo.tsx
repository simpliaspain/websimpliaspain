import { Head } from "vite-react-ssg";
import { SITE_URL } from "@/lib/site";
import { useLanguage } from "@/contexts/LanguageContext";

type SeoProps = {
  /** i18n key of the <title>. */
  titleKey: string;
  /** i18n key of the meta description. */
  descriptionKey: string;
  /** Route path, e.g. "/contacto". Becomes the canonical URL on www. */
  path: string;
  /** Pages that must not be indexed (the 404 page). */
  noindex?: boolean;
};

/**
 * Per-route head tags. Rendered into the static HTML at build time and kept in
 * sync by react-helmet-async on client-side navigation. Everything that is the
 * same on every page (charset, viewport, robots defaults, og:image, favicon,
 * theme-color) stays in index.html.
 */
export function Seo({ titleKey, descriptionKey, path, noindex = false }: SeoProps) {
  const { t } = useLanguage();
  const title = t(titleKey);
  const description = t(descriptionKey);
  const url = `${SITE_URL}${path}`;

  // A noindex page (the 404) gets no canonical, alternates or share URL:
  // those would tell crawlers to index an address that does not exist.
  if (noindex) {
    return (
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
      </Head>
    );
  }

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="es" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
