/**
 * Service demo dialog.
 *
 *   DEMO-1
 *     The "Ver Demo en Acción" button on the services card opened nothing.
 *     The click handler set the open state to the card's *translated title*
 *     while the dialog compared it against a fixed key: the moment the title
 *     was renamed (and in English from day one) the two never matched again.
 *     Nothing threw, so only an assertion catches it: the trigger must open a
 *     real dialog, Escape must close it and focus must return to the trigger.
 *     The lock assertions cover the shared body scroll lock (scroll-lock.ts),
 *     which every overlay on the site must go through.
 */
import { test, expect, type Page } from "@playwright/test";

async function isolate(page: Page) {
  await page.route("**://*/**", (route) =>
    route.request().url().startsWith("http://localhost:4173") ? route.continue() : route.abort(),
  );
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForSelector("html[data-hydrated]");
}

const bodyLock = () => ({
  overflow: document.body.style.overflow || "(unset)",
  position: document.body.style.position || "(unset)",
});

test.describe("service demo dialog", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("DEMO-1: the demo trigger opens a dialog, Escape closes it and focus returns", async ({ page }) => {
    await isolate(page);
    await open(page, "/");
    const trigger = page.locator("#servicios button", { hasText: /demo/i }).first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog, "DEMO-1: a dialog opens").toBeVisible({ timeout: 2000 });
    await expect(dialog.locator("h2, [data-demo-title]").first(), "DEMO-1: the dialog has a title").toHaveCount(1);
    const locked = await page.evaluate(bodyLock);
    expect(locked.overflow, "DEMO-1: shared scroll lock held while open").toBe("hidden");
    expect(await page.evaluate(() => document.activeElement?.closest("[role='dialog']") !== null), "DEMO-1: focus moved into the dialog").toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog, "DEMO-1: Escape closes").toHaveCount(0);
    const released = await page.evaluate(bodyLock);
    expect(released.overflow, "DEMO-1: scroll lock released").toBe("(unset)");
    expect(released.position, "DEMO-1: scroll lock released").toBe("(unset)");
    await expect(trigger, "DEMO-1: focus returns to the trigger").toBeFocused();
  });

  test("DEMO-1: keyboard activation (Enter and Space) opens it too", async ({ page }) => {
    await isolate(page);
    await open(page, "/");
    const trigger = page.locator("#servicios button", { hasText: /demo/i }).first();
    for (const key of ["Enter", "Space"]) {
      await trigger.focus();
      await page.keyboard.press(key);
      await expect(page.locator("[role='dialog']"), `DEMO-1: ${key} opens the dialog`).toBeVisible({ timeout: 2000 });
      await page.keyboard.press("Escape");
      await expect(page.locator("[role='dialog']")).toHaveCount(0);
    }
  });
});
