import { Head } from "vite-react-ssg";
import { SITE_URL } from "@/lib/site";

/** @id of the Organization block in index.html, for `provider` references. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * One JSON-LD block, emitted into <head> of the prerendered page (and kept in
 * sync on client-side navigation). Site-wide blocks (Organization,
 * LocalBusiness) live in index.html; blocks that describe one page's visible
 * content (Service, FAQPage) are rendered next to that content so the two
 * cannot drift apart.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", ...data })}</script>
    </Head>
  );
}
