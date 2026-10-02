/**
 * Service demo video (ServiceDemoVideo).
 *
 *   VIDEO-1  nothing of the video is fetched on page load (1440 and 390):
 *            no poster, no media request until the reader scrolls near it.
 *   VIDEO-2  in view it autoplays muted, and the pause control is visible,
 *            keyboard operable, focus-ringed and labelled in both locales.
 *   VIDEO-3  prefers-reduced-motion: no autoplay and no media request; the
 *            poster shows with a play control that starts it on request.
 *   VIDEO-4  Save-Data: same as reduced motion.
 *   VIDEO-5  autoplay blocked by the browser: the poster stays and the
 *            control offers play - never a black box.
 *   VIDEO-6  the box is 4:3 before the video loads, so loading shifts nothing.
 */
import { test, expect, type Page } from "@playwright/test";

const MEDIA = /\.(mp4|webm)(\?|$)/;
const POSTER = /simplia-demo-poster/;

async function open(page: Page, path = "/", lang: "es" | "en" = "es") {
  await page.addInitScript((l) => localStorage.setItem("language", l), lang);
  await page.goto(path);
  await page.waitForSelector("html[data-hydrated]");
}

function track(page: Page) {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  return urls;
}

async function scrollToVideo(page: Page) {
  await page.locator("#servicios video").evaluate((v) => v.scrollIntoView({ block: "center" }));
}

const control = (page: Page) => page.locator("#servicios figure button");

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test.describe(`demo video at ${viewport.width}px`, () => {
    test.use({ viewport });

    test("VIDEO-1: nothing is fetched on page load", async ({ page }) => {
      const urls = track(page);
      await open(page);
      await page.waitForTimeout(1500);
      expect(urls.filter((u) => MEDIA.test(u)), "VIDEO-1: no video request").toEqual([]);
      expect(urls.filter((u) => POSTER.test(u)), "VIDEO-1: no poster request").toEqual([]);
    });

    test("VIDEO-2: autoplays in view; the control pauses and resumes it", async ({ page }) => {
      await open(page);
      await scrollToVideo(page);
      const video = page.locator("#servicios video");
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 8000 }).toBeGreaterThan(0.5);
      expect(await video.evaluate((v: HTMLVideoElement) => v.muted), "VIDEO-2: muted").toBe(true);
      await expect(control(page)).toBeVisible();
      await expect(control(page)).toHaveAttribute("aria-label", "Pausar la demo");

      // Reach it from the keyboard so :focus-visible applies.
      await control(page).focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(control(page)).toBeFocused();
      const ring = await control(page).evaluate((el) => getComputedStyle(el).boxShadow);
      expect(ring, "VIDEO-2: visible focus ring").not.toBe("none");

      await page.keyboard.press("Enter");
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
      await expect(control(page)).toHaveAttribute("aria-label", "Reproducir la demo");
      await page.keyboard.press("Space");
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
    });
  });
}

test.describe("demo video conditions", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("VIDEO-2: the control is labelled in English", async ({ page }) => {
    await open(page, "/", "en");
    await scrollToVideo(page);
    await expect(control(page)).toHaveAttribute("aria-label", "Pause the demo", { timeout: 8000 });
  });

  test("VIDEO-3: reduced motion shows the poster and does not autoplay", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const urls = track(page);
    await open(page);
    await scrollToVideo(page);
    const video = page.locator("#servicios video");
    await expect(video).toHaveAttribute("poster", POSTER);
    await page.waitForTimeout(1500);
    expect(urls.filter((u) => MEDIA.test(u)), "VIDEO-3: no video request").toEqual([]);
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect(control(page)).toHaveAttribute("aria-label", "Reproducir la demo");
    await control(page).click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 8000 }).toBeGreaterThan(0.2);
    await ctx.close();
  });

  test("VIDEO-4: Save-Data shows the poster and does not fetch the video", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    const urls = track(page);
    await open(page);
    await scrollToVideo(page);
    await expect(page.locator("#servicios video")).toHaveAttribute("poster", POSTER);
    await page.waitForTimeout(1500);
    expect(urls.filter((u) => MEDIA.test(u)), "VIDEO-4: no video request").toEqual([]);
    await expect(control(page)).toHaveAttribute("aria-label", "Reproducir la demo");
  });

  test("VIDEO-5: blocked autoplay keeps the poster and offers play", async ({ page }) => {
    // A browser that blocks autoplay ignores the attribute and rejects play().
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = function () {
        return Promise.reject(new DOMException("blocked", "NotAllowedError"));
      };
      const setAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function (name: string, value: string) {
        if (this instanceof HTMLMediaElement && name.toLowerCase() === "autoplay") return;
        return setAttribute.call(this, name, value);
      };
    });
    await open(page);
    await scrollToVideo(page);
    const video = page.locator("#servicios video");
    await expect(video).toHaveAttribute("poster", POSTER);
    await page.waitForTimeout(1500);
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    // A media element shows its poster until a frame has been played.
    expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(0);
    await expect(control(page)).toHaveAttribute("aria-label", "Reproducir la demo");
  });

  test("VIDEO-6: the box is 4:3 before and after the video loads", async ({ page }) => {
    await open(page);
    const video = page.locator("#servicios video");
    const before = await video.evaluate((v) => v.getBoundingClientRect().height);
    const width = await video.evaluate((v) => v.getBoundingClientRect().width);
    expect(Math.abs(before - (width * 3) / 4)).toBeLessThan(1);
    await scrollToVideo(page);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 8000 }).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate((v) => v.getBoundingClientRect().height)).toBe(before);
  });
});
