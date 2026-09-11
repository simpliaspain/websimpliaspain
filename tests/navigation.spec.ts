/**
 * Client-side navigation must not depend on files that a deploy can remove.
 *
 * What shipped once: vite-react-ssg attaches a loader to every route that, on
 * the first route change, fetches /static-loader-data-manifest-<hash>.json,
 * where <hash> is random per build and baked into the HTML. Every deploy
 * replaces gh-pages wholesale, so a tab holding the previous build's HTML
 * asked for a manifest that no longer existed, GitHub Pages answered with
 * 404.html, `.json()` threw on "<!DOCTYPE", and react-router's error boundary
 * replaced the page with "Unexpected Application Error!". The app has no
 * route loaders; the files it fetched contained only nulls.
 *
 *   STALE-1  no request for static-loader-data* on any client-side navigation.
 *   STALE-2  with the manifest request answered by 404.html - the exact
 *            stale-build condition - every route still navigates and renders.
 *   STALE-3  the built pages carry no data-server-rendered flag on #root,
 *            which is what switches the loader injection on.
 */
import { test, expect, type Page } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROUTES = ["/contacto", "/chatbots-multicanal", "/agentes-telefonicos", "/politica-privacidad", "/"];

async function isolate(page: Page) {
  await page.route("**://*/**", (route) =>
    route.request().url().startsWith("http://localhost:4173") ? route.continue() : route.abort(),
  );
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForSelector("html[data-hydrated]");
}

/** Click a visible in-app link to `href` (menu first, footer as fallback). */
async function navigateTo(page: Page, href: string) {
  const clicked = await page.evaluate((h) => {
    const a = Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[href="${h}"]`)).find(
      (el) => el.getClientRects().length > 0,
    );
    if (!a) return false;
    a.click();
    return true;
  }, href);
  expect(clicked, `a visible link to ${href}`).toBe(true);
  await page.waitForURL(`http://localhost:4173${href}`);
}

test.describe("client-side navigation survives a deploy", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("STALE-1: no loader-data request on any client-side navigation", async ({ page }) => {
    await isolate(page);
    const dataRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("static-loader-data")) dataRequests.push(r.url());
    });
    await open(page, "/");
    for (const href of ROUTES) {
      await navigateTo(page, href);
      await expect(page.locator("h1")).toHaveCount(1);
    }
    expect(dataRequests, "STALE-1: loader-data fetched on navigation").toEqual([]);
  });

  test("STALE-2: navigation works when the build manifest is gone (404.html)", async ({ page }) => {
    await isolate(page);
    // The stale-build condition: whatever manifest the page asks for, the host
    // answers with its 404 page - HTML, status 404, exactly like GitHub Pages.
    await page.route("**/static-loader-data-manifest-*.json", (route) =>
      route.fulfill({
        status: 404,
        contentType: "text/html; charset=utf-8",
        body: readFileSync(join(process.cwd(), "dist", "404.html"), "utf8"),
      }),
    );
    await open(page, "/");
    for (const href of ROUTES) {
      await navigateTo(page, href);
      await expect(page.getByText("Unexpected Application Error"), `STALE-2: error boundary on ${href}`).toHaveCount(0);
      await expect(page.locator("h1"), `STALE-2: ${href} rendered`).toHaveCount(1);
    }
  });

  test("STALE-3: built pages do not carry the data-server-rendered flag", async () => {
    const dist = join(process.cwd(), "dist");
    expect(existsSync(dist), "dist/ exists (run npm run build)").toBe(true);
    const pages = readdirSync(dist).filter((f) => f.endsWith(".html"));
    expect(pages.length).toBeGreaterThanOrEqual(6);
    for (const f of pages) {
      const html = readFileSync(join(dist, f), "utf8");
      expect(html, `${f}: prerendered content present`).toContain("<h1");
      expect(html, `${f}: data-server-rendered would re-enable the loader fetch`).not.toContain("data-server-rendered");
    }
  });
});
