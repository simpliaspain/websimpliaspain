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
    // Runs after every page has been written: one sitemap entry per page.
    onFinished: writeSitemap,
  },
}));
