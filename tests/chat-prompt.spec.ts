/**
 * First-visit chat prompt (ChatPrompt).
 *
 *   PROMPT-1  First visit: nothing early; once the page has been read (a
 *             screenful of scrolling) or SHOW_AFTER_MS has passed, and after
 *             2s idle, it shows - announced politely, without taking focus,
 *             with a 44px hit area; in both locales.
 *   PROMPT-2  The close control dismisses it, and a reload does not bring it
 *             back. Keyboard users can reach the close control and use it.
 *   PROMPT-3  Opening the chat (button) hides it and it does not come back.
 *   PROMPT-4  Clicking the bubble opens the chat.
 *   PROMPT-5  It auto-dismisses after 12s on screen, not sooner.
 *   PROMPT-6  Reduced motion: it appears without animation.
 *   PROMPT-7  Storage unavailable: it never appears.
 *   PROMPT-8  It never sits over an interactive element (1440, 390, while
 *             scrolling through the page).
 *   PROMPT-9  A mouse resting on the chat button brings it up, it survives
 *             the gap between the button and the card, and taking the mouse
 *             away puts it back - without spending the one-per-visitor
 *             nudge.
 *   PROMPT-10 The timed one holds off while the demo is playing in view, and
 *             arrives once it is not.
 *
 * The suite's default storageState marks the prompt as seen (see
 * playwright.config.ts); these tests start from an empty one. Time runs on
 * Playwright's clock, so the delays are exact and fast.
 */
import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

const prompt = (page: Page) => page.locator("[data-chat-prompt]");
/** The whole card is the open control; it is the card's first button. */
const openControl = (page: Page) => page.locator("[data-chat-prompt] button").first();

/**
 * Advance to 47s on the page's clock, whatever the test has already run:
 * past the no-scroll fallback (45s) and its 2s idle with margin, and not a
 * second further than it needs to be. The card auto-dismisses after 12s of
 * visible time, so a test that simply adds 50s to a clock already at 19s
 * brings the card on and then watches it leave again inside the same call.
 */
async function waitItOut(page: Page, alreadyRun = 0) {
  await page.clock.runFor(47000 - alreadyRun);
}
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

for (const [lang, text, who, close] of [
  ["es", "Pregúntame lo que quieras, como haría un cliente tuyo.", "Agente de Simplia", "Cerrar este mensaje"],
  ["en", "Ask me anything, the way one of your clients would.", "Simplia agent", "Dismiss this message"],
] as const) {
  test(`PROMPT-1: first visit shows it after the delay, politely, without taking focus (${lang})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, lang);
    await page.clock.runFor(19000);
    await expect(prompt(page), "PROMPT-1: not before the delay").toHaveCount(0);
    await waitItOut(page, 19000);
    await expect(prompt(page)).toBeVisible();
    await expect(prompt(page), "PROMPT-1: it says who is writing").toContainText(who);
    await expect(openControl(page), "PROMPT-1: the card carries the message").toContainText(text);
    await expect(prompt(page).getByRole("button", { name: close })).toBeVisible();
    await expect(page.locator("[aria-live='polite']").filter({ hasText: text }), "PROMPT-1: announced politely").toHaveCount(1);
    expect(await page.locator("[data-chat-prompt] [role='alert'], [data-chat-prompt][role='alert']").count()).toBe(0);
    expect(await page.evaluate(() => !!document.activeElement?.closest("[data-chat-prompt]")), "PROMPT-1: focus not stolen").toBe(false);
    const box = await prompt(page).boundingBox();
    expect(box!.height, "PROMPT-1: 44px hit area").toBeGreaterThanOrEqual(44);
  });
}

test("PROMPT-1: a screenful of scrolling brings it forward", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.clock.runFor(22000);
  await expect(prompt(page), "PROMPT-1: nothing yet without a sign of interest").toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight + 200, behavior: "instant" as ScrollBehavior }));
  await page.clock.runFor(2500);
  await expect(prompt(page), "PROMPT-1: it comes once the page is being read").toBeVisible();
});

test("PROMPT-1: an interaction postpones it until the page has been idle 2s", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  // The page clock also flows in real time during load, so leave margin:
  // interact just short of the fallback, check 1.2s later (past it, but idle
  // only ~1.2s), then 2s on.
  await page.clock.runFor(44000);
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
  await waitItOut(page);
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
  await page.clock.runFor(60000);
  await expect(prompt(page), "PROMPT-2: not again after reload").toHaveCount(0);
});

test("PROMPT-3: opening the chat hides it and it does not return", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await waitItOut(page);
  await expect(prompt(page)).toBeVisible();
  await page.getByRole("button", { name: "Abrir chat", exact: true }).click();
  await expect(prompt(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Cerrar chat" }).click();
  await page.clock.runFor(60000);
  await expect(prompt(page)).toHaveCount(0);
  await page.reload();
  await page.waitForSelector("html[data-hydrated]");
  await page.clock.runFor(60000);
  await expect(prompt(page), "PROMPT-3: not again after reload").toHaveCount(0);
});

test("PROMPT-4: clicking the bubble opens the chat", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await waitItOut(page);
  await openControl(page).click();
  await expect(page.getByRole("button", { name: "Cerrar chat" })).toBeVisible();
  await expect(prompt(page)).toHaveCount(0);
});

test("PROMPT-5: it auto-dismisses after 12s on screen, not sooner", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  // Brought on by scrolling, so the moment it appears is known and the whole
  // of the 12s is measured from there.
  await page.clock.runFor(22000);
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight + 200, behavior: "instant" as ScrollBehavior }));
  await page.clock.runFor(2500);
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
  await waitItOut(page);
  await expect(prompt(page)).toBeVisible();
  const anim = await prompt(page).evaluate((el) => ({
    name: getComputedStyle(el).animationName,
    transition: getComputedStyle(el).transitionProperty,
    opacity: getComputedStyle(el).opacity,
  }));
  expect(anim.name, "PROMPT-6: no animation").toBe("none");
  expect(anim.transition, "PROMPT-6: and nothing transitions either").toBe("none");
  expect(anim.opacity, "PROMPT-6: fully there, straight away").toBe("1");
  await context.close();
});

test("PROMPT-7: with storage unavailable it never appears", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const blocked = () => { throw new DOMException("blocked", "SecurityError"); };
    Storage.prototype.setItem = blocked;
  });
  await open(page);
  await page.clock.runFor(60000);
  await expect(prompt(page)).toHaveCount(0);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`PROMPT-8: it never covers an interactive element (${viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page);
    await waitItOut(page);
    await expect(prompt(page)).toBeAttached();
    expect(await overlapsInteractive(page), "PROMPT-8: at load").toEqual([]);
    // Hovering pauses its auto-dismiss timer, but it can only be hovered
    // while it is actually visible, and at a given scroll position it may
    // have hidden itself - which is the guarantee under test, not a failure.
    // At 390px the hero's booking card sits under it at scroll 0. The timer
    // only counts visible time anyway and the walk advances the clock by far
    // less than the 12s it needs, so an unhovered walk cannot outlast it;
    // the assertion after the loop is what proves it was never dismissed.
    if (await prompt(page).isVisible()) await prompt(page).hover();
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 150) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior }), y);
      // It re-checks on the next animation frame after a scroll and hides
      // if it would overlap; give it two frames.
      await expect.poll(async () => { await page.clock.runFor(34); return overlapsInteractive(page); }, { message: `PROMPT-8: at scrollY ${y}` }).toEqual([]);
    }
    // A prompt dismissed mid-walk would have made every check above vacuous.
    await expect(prompt(page), "PROMPT-8: still up after the walk").toBeAttached();
  });
}

test("PROMPT-9: the pointer on the chat button brings it up, and taking it away puts it back", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // Already seen, so nothing timed can be what we are looking at.
  await page.addInitScript(() => localStorage.setItem("chatPromptSeen", "1"));
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await expect(prompt(page), "PROMPT-9: nothing at rest").toHaveCount(0);

  await page.getByRole("button", { name: "Abrir chat", exact: true }).hover();
  await expect(prompt(page), "PROMPT-9: the pointer brings it up").toBeVisible();
  await expect
    .poll(async () => prompt(page).evaluate((el) => getComputedStyle(el).opacity), {
      message: "PROMPT-9: and it arrives, rather than being there at nothing",
    })
    .toBe("1");

  // From the button up onto the card: the 16px gap must not lose it.
  const box = (await prompt(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.waitForTimeout(400);
  await expect(prompt(page), "PROMPT-9: it survives the gap").toBeVisible();

  await page.mouse.move(80, 80, { steps: 8 });
  await expect(prompt(page), "PROMPT-9: and leaves with the pointer").toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("chatPromptSeen")),
    "PROMPT-9: a preview is not the nudge",
  ).toBe("1");
});

test("PROMPT-10: it holds off while the demo is playing in view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  // A screenful of scrolling arms the shortcut, so the demo is the only
  // thing left that could be holding the card back.
  await page.evaluate(() => document.getElementById("video")!.scrollIntoView({ block: "center" }));
  await page.waitForFunction(() => {
    const v = document.querySelector<HTMLVideoElement>("#video video");
    return !!v && !v.paused;
  });
  await waitItOut(page);
  await expect(prompt(page), "PROMPT-10: not over the demo").toHaveCount(0);

  // Nothing else changes, so if it arrives now the clip was what held it.
  await page.evaluate(() => document.querySelector<HTMLVideoElement>("#video video")!.pause());
  await page.clock.runFor(3000);
  await expect(prompt(page), "PROMPT-10: and it arrives once the clip is not playing").toBeVisible();
});
