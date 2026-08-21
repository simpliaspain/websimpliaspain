/**
 * Main menu regression suite.
 *
 * Most of this is ordinary behavioural cover for the two menu modes. Three
 * guards are different: they encode bugs that shipped once and that are
 * invisible to code inspection, so they are spelled out here rather than left
 * for the next reader to rediscover.
 *
 *   PORTAL-1 / PORTAL-2
 *     The modal is a portal wrapped in framer-motion's AnimatePresence. If the
 *     nesting is ever flipped back to <AnimatePresence>{open && createPortal()}
 *     the portal is silently discarded, because a portal is not a valid React
 *     *element* and AnimatePresence filters its children. The component still
 *     "opens": state flips, #root gets `inert`, the body scroll locks - and
 *     nothing renders. The result is an unrecoverable page: frozen, inert,
 *     no visible UI and no way to dismiss it. Nothing throws, so only an
 *     assertion catches it.
 *       PORTAL-1: the menu reports open but no [role="dialog"] exists.
 *       PORTAL-2: #root is inert with no visible overlay to dismiss.
 *
 *   LOCK-1
 *     The menu and the chat widget both lock body scroll. When each managed the
 *     body styles itself, the second to lock captured the first one's *locked*
 *     styles as its "original" and restored those on release, leaving the body
 *     permanently `position: fixed; overflow: hidden` with the scroll position
 *     lost. Closing the menu before the chat was the order that bricked it.
 *     Both now share a reference-counted lock. The sequence below is the exact
 *     one that failed.
 *
 *   NEGATIVE CONTROL
 *     An assertion that cannot fail is worthless. The last test injects the
 *     broken state and proves the PORTAL predicates actually fire on it. If
 *     someone weakens the guards, this test fails first.
 */
import { test, expect, type Page } from "@playwright/test";

/** Mirrors HOVER_CLOSE_GRACE in src/hooks/use-main-menu.ts. */
const HOVER_CLOSE_GRACE_MS = 250;

/**
 * The page sets `scroll-behavior: smooth`, so scrollTo animates and any lock
 * taken mid-animation captures a position a few pixels short. Scroll
 * instantly and wait for it to settle so restore assertions are exact.
 */
async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" as ScrollBehavior }), y);
  await page.waitForFunction((top) => window.scrollY === top, y);
}

/** Keep third-party traffic (chat webhook, web fonts) out of the run. */
async function isolate(page: Page) {
  await page.route("**://*/**", (route) =>
    route.request().url().startsWith("http://localhost:4173")
      ? route.continue()
      : route.abort(),
  );
}

const overlayState = () => {
  const root = document.getElementById("root");
  const panel = document.getElementById("main-menu");
  const visible = (el: Element | null) =>
    !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  const openTrigger = Array.from(document.querySelectorAll("[aria-controls='main-menu']")).find(
    (b) => b.getAttribute("aria-expanded") === "true",
  );
  return {
    triggerSaysOpen: !!openTrigger,
    panelInDom: !!panel,
    panelVisible: visible(panel),
    dialogCount: document.querySelectorAll("[role='dialog']").length,
    rootInert: !!root && root.hasAttribute("inert"),
    bodyOverflow: document.body.style.overflow || "(unset)",
    bodyPosition: document.body.style.position || "(unset)",
    scrollY: window.scrollY,
  };
};

const clickVisibleTrigger = () => {
  const trigger = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button[aria-controls='main-menu']"),
  ).find((b) => b.getClientRects().length > 0);
  trigger?.click();
};

/* ─────────────────── Mode A: dropdown (fine pointer, lg+) ─────────────────── */

test.describe("dropdown mode", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("opens on hover intent and stays non-modal", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    const trigger = page.locator("#main-menu-trigger");

    await trigger.hover();
    await page.waitForTimeout(60);
    await expect(page.locator("#main-menu"), "must not open before the 120ms intent delay").toHaveCount(0);

    await expect(page.locator("#main-menu")).toBeVisible({ timeout: 2000 });

    // Hover-open is only safe because it never seizes the page.
    const state = await page.evaluate(overlayState);
    expect(state.dialogCount, "dropdown is not a dialog").toBe(0);
    expect(state.rootInert, "dropdown must not inert the page").toBe(false);
    expect(state.bodyOverflow, "dropdown must not lock scroll").toBe("(unset)");
  });

  test("closes after the grace period, and Escape restores focus", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    const trigger = page.locator("#main-menu-trigger");

    await trigger.hover();
    await expect(page.locator("#main-menu")).toBeVisible();
    await page.mouse.move(10, 400);
    await page.waitForTimeout(120);
    await expect(page.locator("#main-menu"), "still open inside the 250ms grace").toBeVisible();
    await expect(page.locator("#main-menu")).toHaveCount(0, { timeout: 2000 });

    // A deliberate click must not be dismissed by the pointer wandering off.
    await trigger.click();
    await page.mouse.move(10, 600);
    await page.waitForTimeout(500);
    await expect(page.locator("#main-menu"), "click-opened menu survives pointerleave").toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("#main-menu")).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("main-menu-trigger");
  });

  /**
   * CLICK-ON-HOVER-OPEN
   *   Approaching the trigger opens the panel on hover intent, so by the time
   *   the user's click lands the menu is already open. Treating that click as
   *   "close" - which `if (isOpen) close()` does - shuts the menu in the face of
   *   someone who walked over specifically to click it. The click must instead
   *   confirm the intent and anchor the panel, so it no longer closes when the
   *   pointer leaves. Only a second, deliberate click closes it.
   */
  test("a click on a hover-opened menu confirms it instead of closing it", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    const trigger = page.locator("#main-menu-trigger");
    const panel = page.locator("#main-menu");

    await trigger.hover();
    await expect(panel, "hover intent opens the panel").toBeVisible();

    await trigger.click();
    await expect(panel, "the click must not close a hover-opened panel").toBeVisible();

    // The click promoted it to click-opened, so pointerleave no longer applies.
    await page.mouse.move(10, 700);
    await page.waitForTimeout(HOVER_CLOSE_GRACE_MS + 300);
    await expect(panel, "confirmed panel survives the pointerleave grace").toBeVisible();

    await trigger.click();
    await expect(panel, "a second deliberate click closes it").toHaveCount(0);
  });

  /**
   * CLICK-TOGGLE
   *   The fix above must not cost plain click-to-toggle for anyone who never
   *   triggers hover intent - keyboard users, and pointers that arrive and
   *   click inside the 120ms delay.
   */
  test("plain click-to-open still toggles closed on the next click", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    const trigger = page.locator("#main-menu-trigger");
    const panel = page.locator("#main-menu");

    await trigger.click();
    await expect(panel, "click opens from closed").toBeVisible();

    // Past CLICK_TOGGLE_GUARD, so this counts as a fresh intent rather than
    // part of the gesture that opened the panel.
    await page.waitForTimeout(300);
    await trigger.click();
    await expect(panel, "click closes what a click opened").toHaveCount(0);
  });
});

/* ─────────────────── Mode B: modal (coarse pointer) ─────────────────── */

test.describe("modal mode", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("PORTAL-1 / PORTAL-2: an open menu always has a visible dialog", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    await scrollTo(page, 500);
    await page.evaluate(clickVisibleTrigger);
    await expect(page.locator("#main-menu")).toBeVisible();

    const s = await page.evaluate(overlayState);
    expect(
      s.triggerSaysOpen && s.dialogCount === 0,
      "PORTAL-1: menu reports open but no [role=dialog] rendered - unrecoverable frozen page",
    ).toBe(false);
    expect(
      s.rootInert && !s.panelVisible,
      "PORTAL-2: #root inert with no visible overlay - nothing to dismiss",
    ).toBe(false);

    expect(s.dialogCount).toBe(1);
    expect(s.rootInert).toBe(true);
    expect(s.bodyOverflow).toBe("hidden");
  });

  test("traps focus and cleans up on Escape", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    await scrollTo(page, 500);
    await page.evaluate(clickVisibleTrigger);
    await expect(page.locator("#main-menu")).toBeVisible();

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() =>
        document.getElementById("main-menu")?.contains(document.activeElement),
      );
      expect(inside, `focus escaped the dialog on tab ${i + 1}`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(page.locator("#main-menu")).toHaveCount(0);
    const after = await page.evaluate(overlayState);
    expect(after.rootInert).toBe(false);
    expect(after.bodyOverflow).toBe("(unset)");
    expect(after.bodyPosition).toBe("(unset)");
    expect(after.scrollY, "scroll position restored on close").toBe(500);
  });

  test("LOCK-1: chat + menu share one reference-counted scroll lock", async ({ page }) => {
    await isolate(page);
    await page.goto("/");
    await scrollTo(page, 500);

    // `inert` does not block programmatic events; the widget listens on window.
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("open-chatbot")));
    await expect(page.locator("button[aria-label='Cerrar chat']")).toBeVisible();

    await page.evaluate(clickVisibleTrigger);
    await expect(page.locator("#main-menu")).toBeVisible();

    // Close the menu first - the order that bricked the old implementation.
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("#main-menu button[aria-label]")?.click();
    });
    await expect(page.locator("#main-menu")).toHaveCount(0);

    const held = await page.evaluate(overlayState);
    expect(held.bodyOverflow, "LOCK-HELD: still locked while the chat is open").toBe("hidden");

    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>("button[aria-label='Cerrar chat']")?.click();
    });
    await page.waitForTimeout(500);

    const done = await page.evaluate(overlayState);
    expect(done.bodyOverflow, "LOCK-1: body released").toBe("(unset)");
    expect(done.bodyPosition, "LOCK-1: body released").toBe("(unset)");
    expect(done.scrollY, "LOCK-1: scroll restored").toBe(500);
  });
});

/* ─────────────────── negative control ─────────────────── */

test.describe("guard integrity", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the PORTAL guards actually fire on the broken state", async ({ page }) => {
    await isolate(page);
    await page.goto("/");

    const healthy = await page.evaluate(overlayState);
    expect(healthy.triggerSaysOpen && healthy.dialogCount === 0).toBe(false);
    expect(healthy.rootInert && !healthy.panelVisible).toBe(false);

    // Reproduce exactly what the discarded-portal bug looked like in the DOM.
    await page.evaluate(() => {
      document.querySelector("button[aria-controls='main-menu']")?.setAttribute("aria-expanded", "true");
      document.getElementById("root")?.setAttribute("inert", "");
      document.body.style.overflow = "hidden";
    });

    const broken = await page.evaluate(overlayState);
    expect(broken.triggerSaysOpen && broken.dialogCount === 0, "PORTAL-1 must fire here").toBe(true);
    expect(broken.rootInert && !broken.panelVisible, "PORTAL-2 must fire here").toBe(true);
  });
});
