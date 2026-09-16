/**
 * Contact form spam protection (client side only).
 *
 *   SPAM-1  honeypot: a hidden "website" field humans never see. Filled -> the
 *           form shows the normal success state and posts nothing.
 *   SPAM-2  time to submit: a submission under 3 s after the form became
 *           interactive is treated the same way.
 *   SPAM-3  control: a normal submission after a realistic delay DOES post,
 *           with the unchanged payload shape.
 *
 * Silent success is deliberate: a bot that sees an error learns to adapt. The
 * webhook is always intercepted here - nothing reaches n8n from the suite.
 */
import { test, expect, type Page } from "@playwright/test";

const WEBHOOK = "**/webhook/form-lead";

async function isolate(page: Page) {
  await page.route("**://*/**", (route) =>
    route.request().url().startsWith("http://localhost:4173") ? route.continue() : route.abort(),
  );
}

/** Intercept the webhook, count posts, answer like n8n does. Registered AFTER isolate: later routes match first. */
async function interceptWebhook(page: Page) {
  const posts: string[] = [];
  await page.route(WEBHOOK, (route) => {
    posts.push(route.request().postData() ?? "");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  return posts;
}

async function fillForm(page: Page) {
  await page.fill("#nombre", "Ana");
  await page.fill("#apellidos", "García López");
  await page.fill("#email", "ana@example.com");
  await page.fill("#telefono", "600123456");
  await page.fill("#informacion", "Tenemos una clínica y nos interesa un agente para WhatsApp.");
}

test.describe("contact form spam protection", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("SPAM-1: a filled honeypot shows success and posts nothing", async ({ page }) => {
    await isolate(page);
    const posts = await interceptWebhook(page);
    await page.goto("/contacto");
    await page.waitForSelector("html[data-hydrated]");
    await fillForm(page);
    // The honeypot must exist, be outside the tab order and hidden from AT.
    const trap = page.locator("input[name='website']");
    await expect(trap).toHaveCount(1);
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(trap).toHaveAttribute("autocomplete", "off");
    expect(await trap.evaluate((el) => !!el.closest("[aria-hidden='true']")), "SPAM-1: hidden from screen readers").toBe(true);
    // Off-screen, not display:none (a display:none field is skipped by many
    // bots): the box must lie entirely outside the viewport.
    const geometry = await trap.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { display: getComputedStyle(el).display, offscreen: r.right <= 0 || r.bottom <= 0 };
    });
    expect(geometry.display, "SPAM-1: rendered (not display:none)").not.toBe("none");
    expect(geometry.offscreen, "SPAM-1: hidden from sighted users").toBe(true);
    // A bot fills every field it finds; simulate it without focusing the trap.
    await trap.evaluate((el) => {
      const input = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(input, "https://spam.example");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForTimeout(3500);
    await page.click("button[type='submit']");
    await expect(page.locator("h1"), "SPAM-1: normal success state shown").toContainText(/gracias|thank/i, { timeout: 5000 });
    expect(posts.length, "SPAM-1: nothing posted to the webhook").toBe(0);
  });

  test("SPAM-2: submitting within 3 s of the form appearing posts nothing", async ({ page }) => {
    await isolate(page);
    const posts = await interceptWebhook(page);
    await page.goto("/contacto");
    await page.waitForSelector("html[data-hydrated]");
    await fillForm(page);
    await page.click("button[type='submit']");
    await expect(page.locator("h1"), "SPAM-2: normal success state shown").toContainText(/gracias|thank/i, { timeout: 5000 });
    expect(posts.length, "SPAM-2: nothing posted to the webhook").toBe(0);
  });

  test("SPAM-3: a normal submission after a realistic delay posts the unchanged payload", async ({ page }) => {
    await isolate(page);
    const posts = await interceptWebhook(page);
    await page.goto("/contacto");
    await page.waitForSelector("html[data-hydrated]");
    await fillForm(page);
    await page.waitForTimeout(3500);
    await page.click("button[type='submit']");
    await expect(page.locator("h1")).toContainText(/gracias|thank/i, { timeout: 5000 });
    expect(posts.length, "SPAM-3: exactly one post").toBe(1);
    expect(JSON.parse(posts[0]), "SPAM-3: payload shape unchanged").toEqual({
      nombre: "Ana",
      apellidos: "García López",
      correo: "ana@example.com",
      telefono: "600123456",
      informacion_adicional: "Tenemos una clínica y nos interesa un agente para WhatsApp.",
    });
  });

  test("SPAM-4: the honeypot is not in the tab order", async ({ page }) => {
    await isolate(page);
    await interceptWebhook(page);
    await page.goto("/contacto");
    await page.waitForSelector("html[data-hydrated]");
    await page.focus("#nombre");
    const visited: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      visited.push(await page.evaluate(() => (document.activeElement as HTMLElement)?.getAttribute("name") || (document.activeElement as HTMLElement)?.tagName));
    }
    expect(visited, "SPAM-4: tabbing never lands on the trap").not.toContain("website");
    expect(visited.slice(0, 4), "SPAM-4: order of the real fields intact").toEqual(["apellidos", "email", "telefono", "informacion"]);
  });
});
