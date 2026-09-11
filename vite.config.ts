import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { writeSitemap } from "./scripts/sitemap.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Build-time prerender (vite-react-ssg). GitHub Pages is static hosting, so
  // every route is rendered to its own HTML file here; the client then
  // hydrates it. Only the Spanish default is prerendered - see RootLayout.
  ssgOptions: {
    entry: "src/main.tsx",
    // /route -> dist/route.html. GitHub Pages serves route.html on the
    // extensionless URL with no redirect, so public URLs do not change.
    dirStyle: "flat",
    // No prettifying: reformatting the markup causes hydration mismatches.
    formatting: "none",
    // No critical-CSS inlining: it needs an extra optional dependency and
    // rewrites the stylesheet link, which the deploy guards did not expect.
    crittersOptions: false,
    beastiesOptions: false,
    // Do NOT put data-server-rendered back. vite-react-ssg writes
    // <div id="root" data-server-rendered="true"> and, in the browser, that
    // attribute is what switches on a loader for every route. The loader has
    // nothing to load - this app has no route loaders, the files it fetched
    // were {"0":null} - but on the first client-side navigation it fetches
    // /static-loader-data-manifest-<hash>.json, where <hash> is
    // Math.random() at build time and baked into each page. Every deploy
    // replaces gh-pages wholesale, so any tab holding the previous build's
    // HTML asked for a manifest that no longer existed; GitHub Pages answered
    // with 404.html, `.json()` threw on "<!DOCTYPE", and react-router's error
    // boundary replaced the page with "Unexpected Application Error!". With
    // the attribute gone the loader is never attached: no request, nothing to
    // go stale. Production builds still hydrate (the attribute only affects
    // render-vs-hydrate in development). tests/navigation.spec.ts pins this;
    // upstream has no supported switch for it (vite-react-ssg 0.9.x).
    onPageRendered: (_route, html) => html.replace(' data-server-rendered="true"', ""),
    // Runs after every page has been written: one sitemap entry per page.
    onFinished: writeSitemap,
  },
}));
