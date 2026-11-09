/**
 * La conversación de ejemplo (ExampleChat), la del cuadro de #accion.
 *
 *   CHAT-1  se reproduce entera en cualquier ventana razonable. A 768x900 no
 *           lo hacía: la tarjeta es alta, y las dos condiciones que arrancan
 *           la reproducción se miden contra la ventana encogida por el
 *           margen del observador, así que no llegaba a ninguna de las dos
 *           aunque la tuvieras delante. Quien entraba por ahí se quedaba
 *           mirando un solo mensaje.
 */
import { test, expect, type Page } from "@playwright/test";

async function reproducir(page: Page) {
  await page.evaluate(() => document.getElementById("accion")?.scrollIntoView({ block: "center" }));
  await page.waitForSelector("#accion figcaption button", { timeout: 30000 });
}

/**
 * Sólo las burbujas de mensaje. La de «está escribiendo» también lleva
 * aria-hidden, así que sin excluirla la cuenta llega a cinco antes de que
 * haya cinco mensajes.
 */
function mensajes(page: Page) {
  return page.locator('#accion figure.relative [aria-hidden="false"]:not(.pointer-events-none)');
}

for (const [ancho, alto] of [
  [1440, 900],
  [768, 900],
  [1024, 768],
  [390, 844],
] as const) {
  test(`CHAT-1: la conversación se reproduce entera a ${ancho}x${alto}`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto("/");
    await page.waitForSelector("html[data-hydrated]");
    await reproducir(page);
    await expect(mensajes(page), `CHAT-1: a ${ancho}x${alto} se queda a medias`).toHaveCount(5);
  });
}
