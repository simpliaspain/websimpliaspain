/**
 * First-visit chat prompt (ChatPrompt).
 *
 *   PROMPT-1  First visit: nothing at 5s; after 8s on the page and 2s idle it
 *             shows, announced politely, without taking focus, with a 44px
 *             hit area; in both locales.
 *   PROMPT-2  The close control dismisses it, and a reload does not bring it
 *             back. Keyboard users can reach the close control and use it.
 *   PROMPT-3  Opening the chat (button) hides it and it does not come back.
 *   PROMPT-4  Clicking the bubble opens the chat.
 *   PROMPT-5  It auto-dismisses after 12s on screen, not sooner.
 *   PROMPT-6  Reduced motion: it appears without animation.
 *   PROMPT-7  Storage unavailable: it never appears.
 *   PROMPT-8  It never sits over an interactive element (1440, 390, while
 *             scrolling through the page).
 *
 * The suite's default storageState marks the prompt as seen (see
 * playwright.config.ts); these tests start from an empty one. Time runs on
 * Playwright's clock, so the delays are exact and fast.
 */
import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

const prompt = (page: Page) => page.locator("[data-chat-prompt]");
const INTERACTIVE = 'a[href], button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])';

async function open(page: Page, lang: "es" | "en" = "es") {
  await page.clock.install();
  await page.addInitScript((l) => localStorage.setItem("language", l), lang);
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
}

async function overlapsInteractive(page: Page) {
  return page.evaluate((sel) => {
    const bubble = document.querySelector("[data-chat-prompt]");
    if (!bubble || getComputedStyle(bubble).visibility === "hidden") return [];
    const b = bubble.getBoundingClientRect();
    return [...document.querySelectorAll<HTMLElement>(sel)]
      .filter((el) => !bubble.contains(el) && !el.closest("[aria-hidden='true'], [inert]"))
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top; })
      .map((el) => el.textContent?.trim().slice(0, 30) || el.getAttribute("aria-label") || el.tagName);
  }, INTERACTIVE);
}

for (const [lang, text, close] of [["es", "¿En qué puedo ayudarte?", "Cerrar este mensaje"], ["en", "How can I help you?", "Dismiss this message"]] as const) {
  test(`PROMPT-1: first visit shows it after the delay, politely, without taking focus (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, lang);
    await page.clock.runFor(5000);
    await expect(prompt(page), "PROMPT-1: not before the delay").toHaveCount(0);
    await page.clock.runFor(4000);
    await expect(prompt(page)).toBeVisible();
    await expect(prompt(page).getByRole("button", { name: text })).toBeVisible();
    await expect(prompt(page).getByRole("button", { name: close })).toBeVisible();
    await expect(page.locator("[aria-live='polite']").filter({ hasText: text }), "PROMPT-1: announced politely").toHaveCount(1);
    expect(await page.locator("[data-chat-prompt] [role='alert'], [data-chat-prompt][role='alert']").count()).toBe(0);
    expect(await page.evaluate(() => !!document.activeElement?.closest("[data-chat-prompt]")), "PROMPT-1: focus not stolen").toBe(false);
    const box = await prompt(page).boundingBox();
    expect(box!.height, "PROMPT-1: 44px hit area").toBeGreaterThanOrEqual(44);
  });
}

test("PROMPT-1: an interaction postpones it until the page has been idle 2s", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  // The page clock also flows in real time during load, so leave margin:
  // interact at ~7s, check at ~8.2s (idle only ~1.2s), then after 2s more.
  await page.clock.runFor(7000);
  // A key press is an interaction (synthetic wheel scrolling is not
  // delivered while the page clock is installed).
  await page.keyboard.press("Shift");
  await page.clock.runFor(1200);
  await expect(prompt(page), "PROMPT-1: not mid-interaction").toHaveCount(0);
  await page.clock.runFor(2000);
  await expect(prompt(page)).toBeVisible();
});

test("PROMPT-2: the close control dismisses it for good; keyboard can reach it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.clock.runFor(9000);
  await expect(prompt(page)).toBeVisible();
  // Keyboard: Shift+Tab back from the chat button reaches the close control.
  await page.getByRole("button", { name: "Abrir chat", exact: true }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Cerrar este mensaje" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(prompt(page)).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("chatPromptSeen"))).toBe("1");
  await page.reload();
  await page.waitForSelector("html[data-hydrated]");
  await page.clock.runFor(30000);
  await expect(prompt(page), "PROMPT-2: not again after reload").toHaveCount(0);
});

test("PROMPT-3: opening the chat hides it and it does not return", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.clock.runFor(9000);
  await expect(prompt(page)).toBeVisible();
  await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
  await expect(prompt(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Cerrar chat" }).click();
  await page.clock.runFor(30000);
  await expect(prompt(page)).toHaveCount(0);
  await page.reload();
  await page.waitForSelector("html[data-hydrated]");
  await page.clock.runFor(30000);
  await expect(prompt(page), "PROMPT-3: not again after reload").toHaveCount(0);
});

test("PROMPT-4: clicking the bubble opens the chat", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.clock.runFor(9000);
  await prompt(page).getByRole("button", { name: "¿En qué puedo ayudarte?" }).click();
  await expect(page.getByRole("button", { name: "Cerrar chat" })).toBeVisible();
  await expect(prompt(page)).toHaveCount(0);
});

test("PROMPT-5: it auto-dismisses after 12s on screen, not sooner", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.clock.runFor(9000);
  await expect(prompt(page)).toBeVisible();
  await page.clock.runFor(10000);
  await expect(prompt(page), "PROMPT-5: still there at 10s").toBeVisible();
  await page.clock.runFor(3000);
  await expect(prompt(page)).toHaveCount(0);
});

test("PROMPT-6: reduced motion shows it without animation", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", baseURL: "http://localhost:4173" });
  const page = await context.newPage();
  await open(page);
  await page.clock.runFor(9000);
  await expect(prompt(page)).toBeVisible();
  const anim = await prompt(page).evaluate((el) => ({ name: getComputedStyle(el).animationName, cls: el.className }));
  expect(anim.name, "PROMPT-6: no animation").toBe("none");
  expect(anim.cls).not.toContain("animate-in");
  await context.close();
});

test("PROMPT-7: with storage unavailable it never appears", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const blocked = () => { throw new DOMException("blocked", "SecurityError"); };
    Storage.prototype.setItem = blocked;
  });
  await open(page);
  await page.clock.runFor(30000);
  await expect(prompt(page)).toHaveCount(0);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`PROMPT-8: it never covers an interactive element (${viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page);
    await page.clock.runFor(9000);
    await expect(prompt(page)).toBeAttached();
    expect(await overlapsInteractive(page), "PROMPT-8: at load").toEqual([]);
    // Scroll through the whole page while it is up (hover pauses its timer,
    // the scroll listener re-checks the overlap on every frame).
    await prompt(page).hover();
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 150) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior }), y);
      // It re-checks on the next animation frame after a scroll and hides
      // if it would overlap; give it two frames.
      await expect.poll(async () => { await page.clock.runFor(34); return overlapsInteractive(page); }, { message: `PROMPT-8: at scrollY ${y}` }).toEqual([]);
    }
  });
}
