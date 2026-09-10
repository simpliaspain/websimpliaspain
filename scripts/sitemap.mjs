// Writes dist/sitemap.xml from the pages the prerender actually produced.
// Called from ssgOptions.onFinished in vite.config.ts, so it runs at the end
// of every `npm run build` and never goes stale by hand.
//
// <lastmod> is the date of the last commit that touched the page's source,
// not the build date: a rebuild that changes nothing must not claim every
// page changed today. The workflows clone with fetch-depth: 0 for this.
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const SITE = "https://www.simpliaspain.com";

// Route -> the files whose history dates that page. All visible copy lives in
// LanguageContext.tsx, shared by every page, so it is deliberately left out:
// including it would stamp every page with the date of the last text edit
// anywhere. Adding a page without an entry here fails the build on purpose.
const SOURCES = {
  "/": ["src/pages/Index.tsx", "src/components/sections"],
  "/chatbots-multicanal": ["src/pages/ChatbotsMulticanal.tsx"],
  "/agentes-telefonicos": ["src/pages/AgentesTelefonicos.tsx"],
  "/contacto": ["src/pages/Contacto.tsx"],
  "/politica-privacidad": ["src/pages/PoliticaPrivacidad.tsx"],
};

// Not a page: the file GitHub Pages serves for unknown URLs.
const EXCLUDED = new Set(["404.html"]);

function lastCommitDate(paths) {
  const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
    encoding: "utf8",
  }).trim();
  if (!out) throw new Error(`sitemap: no commit found for ${paths.join(", ")}`);
  return out.slice(0, 10); // YYYY-MM-DD; the sitemap protocol accepts W3C dates
}

export function writeSitemap(outDir) {
  const pages = readdirSync(outDir)
    .filter((f) => f.endsWith(".html") && !EXCLUDED.has(f))
    .map((f) => (f === "index.html" ? "/" : `/${f.slice(0, -".html".length)}`))
    .sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));

  const entries = pages.map((route) => {
    const sources = SOURCES[route];
    if (!sources) {
      throw new Error(
        `sitemap: ${route} was prerendered but has no entry in SOURCES (scripts/sitemap.mjs)`,
      );
    }
    return `  <url>\n    <loc>${SITE}${route}</loc>\n    <lastmod>${lastCommitDate(sources)}</lastmod>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  writeFileSync(join(outDir, "sitemap.xml"), xml);
  console.log(`sitemap: ${pages.length} URLs -> ${join(outDir, "sitemap.xml")}`);
}
