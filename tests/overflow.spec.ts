/**
 * No horizontal overflow, on any route, in either motion mode.
 *
 *   OVERFLOW-1  Nothing on any route can be scrolled to sideways, and no
 *               element reaches past the page's content box, at 1440 and
 *               390, animated and reduced motion.
 *
 * This used to be `scrollWidth === clientWidth`, which stopped meaning what
 * it says on 07/11/2026, when `html` gained `scrollbar-gutter: stable` so
 * that locking the page for the menu stops widening it. A reserved gutter
 * puts a permanent 15px between those two numbers on a classic-scrollbar
 * platform with nothing overflowing at all - and which of the two it moves
 * depends on whether the run paints scrollbars, so the old check could fail
 * in either direction for no reason.
 *
 * What it asks instead is the thing a reader would notice, and it is
 * stricter rather than looser: try to scroll the document to the right and
 * it must not move, and separately, no element may stick out past the
 * content box. A real overflow fails both.
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
          const { scrolledSideways, worst } = await page.evaluate(() => {
            const root = document.documentElement;
            root.scrollLeft = 9999;
            const scrolledSideways = root.scrollLeft;
            root.scrollLeft = 0;
            let worst: { right: number; what: string } | null = null;
            for (const el of document.querySelectorAll("body *")) {
              const box = el.getBoundingClientRect();
              if (box.width === 0 || box.height === 0) continue;
              if (box.right <= root.clientWidth + 0.5) continue;
              if (!worst || box.right > worst.right) {
                worst = {
                  right: Math.round(box.right),
                  what: el.tagName.toLowerCase() + "." + String(el.className || "").slice(0, 40),
                };
              }
            }
            return { scrolledSideways, worst };
          });
          expect(scrolledSideways, `${route} scrolls sideways`).toBe(0);
          expect(worst, `${route} has something past the right edge`).toBeNull();
        }
      });
    });
  }
}
