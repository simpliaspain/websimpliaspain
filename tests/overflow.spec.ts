/**
 * No horizontal overflow, on any route, in either motion mode.
 *
 *   OVERFLOW-1  document.scrollWidth === clientWidth on every route at 1440
 *               and 390, animated and reduced motion.
 *
 * (The MARQUEE-* checks went with the technology logo marquee, removed from
 * the home page on 28/10/2026.)
 */
import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/", "/chatbots-multicanal", "/agentes-telefonicos", "/como-trabajamos", "/contacto", "/politica-privacidad", "/404"];

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForSelector("html[data-hydrated]");
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test.describe(`${viewport.width}px, motion ${reducedMotion}`, () => {
      test.use({ viewport, contextOptions: { reducedMotion } });

      test("OVERFLOW-1: no route overflows horizontally", async ({ page }) => {
        for (const route of ROUTES) {
          await open(page, route);
          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(scrollWidth, `${route} scrollWidth`).toBe(clientWidth);
        }
      });
    });
  }
}
