/**
 * La conversación de ejemplo (ExampleChat), la del cuadro de #accion.
 *
 *   CHAT-1  se reproduce entera en cualquier ventana razonable. A 768x900 no
 *           lo hacía: la tarjeta es alta, y las dos condiciones que arrancan
 *           la reproducción se miden contra la ventana encogida por el
 *           margen del observador, así que no llegaba a ninguna de las dos
 *           aunque la tuvieras delante. Quien entraba por ahí se quedaba
 *           mirando un solo mensaje.
 *   CHAT-2  no suena nada de fábrica, ni siquiera reproduciéndose sola.
 *   CHAT-3  el interruptor enciende, suena una vez al encenderlo, suena un
 *           tono por mensaje al volver a reproducir, se recuerda, y silencia.
 *   CHAT-4  «volver a reproducir» sigue centrado bajo la tarjeta con el
 *           interruptor al lado, y los dos no se solapan.
 */
import { test, expect, type Page } from "@playwright/test";

/** Cuenta los osciladores que se crean, que es sonar sin tener que oírlo. */
async function contarTonos(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __tonos: number }).__tonos = 0;
    const Orig = window.AudioContext;
    if (!Orig) return;
    window.AudioContext = class extends Orig {
      createOscillator() {
        (window as unknown as { __tonos: number }).__tonos++;
        return super.createOscillator();
      }
    } as typeof AudioContext;
  });
}

const tonos = (page: Page) => page.evaluate(() => (window as unknown as { __tonos: number }).__tonos);

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

/** La reproducción ha terminado cuando vuelve a haber «volver a reproducir». */
async function hastaElFinal(page: Page) {
  const boton = page.getByRole("button", { name: "Volver a reproducir" });
  await expect(boton).toBeHidden();
  await expect(boton).toBeVisible({ timeout: 30000 });
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

test("CHAT-2: de fábrica no suena nada", async ({ page }) => {
  await contarTonos(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await reproducir(page);
  expect(await tonos(page), "CHAT-2: ha sonado sin que nadie lo pidiera").toBe(0);
});

test("CHAT-3: el interruptor enciende, suena, se recuerda y silencia", async ({ page }) => {
  await contarTonos(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await reproducir(page);

  await page.getByRole("button", { name: "Con sonido" }).click();
  expect(await tonos(page), "CHAT-3: encenderlo tiene que confirmarse con un tono").toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("chatSonido"))).toBe("1");

  await page.evaluate(() => ((window as unknown as { __tonos: number }).__tonos = 0));
  await page.getByRole("button", { name: "Volver a reproducir" }).click();
  await hastaElFinal(page);
  expect(await tonos(page), "CHAT-3: un tono por mensaje que entra").toBe(4);

  await page.getByRole("button", { name: "Silenciar" }).click();
  await page.evaluate(() => ((window as unknown as { __tonos: number }).__tonos = 0));
  await page.getByRole("button", { name: "Volver a reproducir" }).click();
  await hastaElFinal(page);
  expect(await tonos(page), "CHAT-3: silenciado es silenciado").toBe(0);
});

for (const ancho of [1440, 390, 360]) {
  test(`CHAT-4: el replay sigue centrado bajo la tarjeta a ${ancho}px`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 900 });
    await page.goto("/");
    await page.waitForSelector("html[data-hydrated]");
    await reproducir(page);
    const m = await page.evaluate(() => {
      const botones = document.querySelectorAll("#accion figcaption button");
      const tarjeta = document.querySelector("#accion figure.relative .bloom > div")!;
      const t = tarjeta.getBoundingClientRect();
      const r = botones[0].getBoundingClientRect();
      const s = botones[1].getBoundingClientRect();
      return {
        desviacion: Math.abs(r.x + r.width / 2 - (t.x + t.width / 2)),
        solapan: r.right > s.left,
      };
    });
    expect(m.desviacion, `CHAT-4: descentrado a ${ancho}px`).toBeLessThan(1);
    expect(m.solapan, `CHAT-4: los dos controles se pisan a ${ancho}px`).toBe(false);
  });
}
