/**
 * No horizontal overflow, on any route, in either motion mode.
 *
 * What shipped once: under prefers-reduced-motion (Windows turns it on when
 * "Animation effects" is off) the logo marquee's viewport became
 * overflow-x:auto so the static strip could be scrolled. On machines with
 * classic scrollbars that drew a grey, draggable scrollbar under the logo row,
 * left the 2195px strip hanging off a centred caption, and added 15px to the
 * section. The document itself never overflowed - the marquee was its own
 * scroll container - so a document-level check alone does not catch it.
 *
 *   OVERFLOW-1  document.scrollWidth === clientWidth on every route at 1440
 *               and 390, animated and reduced motion.
 *   MARQUEE-1   animated: the marquee viewport clips its own track
 *               (overflow-x hidden) instead of relying on the Section.
 *   MARQUEE-2   reduced motion: the strip is not scrollable - it fits its
 *               viewport and every logo is inside it.
 *   MARQUEE-3   logo size is explicit px: 24px tall at any root font size.
 */
import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/", "/chatbots-multicanal", "/agentes-telefonicos", "/contacto", "/politica-privacidad", "/404"];

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

      test(reducedMotion === "reduce" ? "MARQUEE-2: the static strip fits its viewport" : "MARQUEE-1: the viewport clips its own track", async ({ page }) => {
        await open(page, "/");
        const vp = page.locator("#partners .marquee-viewport");
        const m = await vp.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const logos = [...el.querySelectorAll("img")].filter((img) => img.getBoundingClientRect().width > 0);
          return {
            overflowX: getComputedStyle(el).overflowX,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            visible: logos.length,
            outside: logos.filter((img) => {
              const r = img.getBoundingClientRect();
              return r.left < box.left || r.right > box.right;
            }).length,
          };
        });
        if (reducedMotion === "reduce") {
          expect(m.scrollWidth).toBeLessThanOrEqual(m.clientWidth);
          expect(m.visible).toBe(21);
          expect(m.outside).toBe(0);
        } else {
          expect(m.overflowX).toBe("hidden");
        }
      });
    });
  }
}

test.describe("logo size", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("MARQUEE-3: logos are 24px tall whatever the root font size", async ({ page }) => {
    await open(page, "/");
    for (const rootPx of [16, 24]) {
      await page.evaluate((px) => (document.documentElement.style.fontSize = `${px}px`), rootPx);
      const heights = await page.locator("#partners img").evaluateAll((imgs) =>
        [...new Set(imgs.map((img) => img.getBoundingClientRect().height))],
      );
      expect(heights, `root ${rootPx}px`).toEqual([24]);
    }
  });
});
