// postbuild: dist/404.html is the SPA fallback GitHub Pages serves for every
// unknown URL. It used to be a copy of index.html; it is now the prerendered
// NotFound page, written by vite-react-ssg from the "/404" route, so a broken
// link shows an honest 404 instead of flashing the home page first.
//
// This script no longer creates the file. It refuses to let a build through
// without it, or with the unbuilt entry in it, which is exactly what the
// deploy guards check for - the check just happens earlier, and fails loudly.
import { existsSync, readFileSync } from "node:fs";

const file = "dist/404.html";

if (!existsSync(file)) {
  console.error(`postbuild: ${file} is missing - the "/404" route was not prerendered.`);
  process.exit(1);
}

const html = readFileSync(file, "utf8");

if (html.includes("/src/main.tsx")) {
  console.error(`postbuild: ${file} is the unbuilt entry, not build output.`);
  process.exit(1);
}
// Any hashed bundle counts: vite-react-ssg names the client entry "app",
// plain vite names it "index". The guard is "built output", not a filename.
if (!/assets\/[\w-]+-[\w-]+\.js/.test(html)) {
  console.error(`postbuild: ${file} does not reference a hashed bundle.`);
  process.exit(1);
}
if (!html.includes("<h1")) {
  console.error(`postbuild: ${file} has no prerendered content - it must be the NotFound page.`);
  process.exit(1);
}

console.log(`postbuild: ${file} is the prerendered NotFound page.`);
