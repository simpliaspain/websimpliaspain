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
 *           ding por mensaje al volver a reproducir, se recuerda, y silencia.
 *           Y lo que suena es el archivo del vídeo, no la campana de respaldo.
 *   CHAT-4  «volver a reproducir» sigue centrado bajo la tarjeta con el
 *           interruptor al lado, y los dos no se solapan.
 *   CHAT-5  si el archivo del ding no carga, la campana de respaldo suena en
 *           su lugar - y en todos los mensajes, no sólo en el primero.
 */
import { test, expect, type Page } from "@playwright/test";

type Cuenta = { muestras: number; sintetizados: number };

/**
 * Cuenta sonidos sin tener que oírlos, y distingue de dónde salen: una
 * `muestra` es el ding del vídeo, el archivo; un `sintetizado` es la campana
 * de respaldo, la que sólo debe sonar si el archivo no se puede cargar. Que
 * el respaldo esté a cero es parte de lo que se comprueba: si el archivo se
 * rompiera o desapareciera, la web seguiría sonando y nadie se enteraría.
 */
async function contarTonos(page: Page) {
  await page.addInitScript(() => {
    const cuenta = { muestras: 0, sintetizados: 0 };
    (window as unknown as { __sonidos: typeof cuenta }).__sonidos = cuenta;
    const Orig = window.AudioContext;
    if (!Orig) return;
    window.AudioContext = class extends Orig {
      createBufferSource() {
        cuenta.muestras++;
        return super.createBufferSource();
      }
      createOscillator() {
        cuenta.sintetizados++;
        return super.createOscillator();
      }
    } as typeof AudioContext;
  });
}

const tonos = (page: Page) => page.evaluate(() => (window as unknown as { __sonidos: Cuenta }).__sonidos);

const aCero = (page: Page) =>
  page.evaluate(() => {
    const c = (window as unknown as { __sonidos: Cuenta }).__sonidos;
    c.muestras = 0;
    c.sintetizados = 0;
  });

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
  expect(await tonos(page), "CHAT-2: ha sonado sin que nadie lo pidiera").toEqual({
    muestras: 0,
    sintetizados: 0,
  });
});

test("CHAT-3: el interruptor enciende, suena, se recuerda y silencia", async ({ page }) => {
  await contarTonos(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await reproducir(page);

  // El archivo se pide justo al encender, así que el primer ding puede tardar
  // unos milisegundos en llegar. Espera a que suene en vez de mirar una vez.
  await page.getByRole("button", { name: "Con sonido" }).click();
  await expect
    .poll(async () => (await tonos(page)).muestras, {
      message: "CHAT-3: encenderlo tiene que confirmarse con el ding del vídeo",
      timeout: 10000,
    })
    .toBe(1);
  expect(
    (await tonos(page)).sintetizados,
    "CHAT-3: ha sonado la campana de respaldo, o sea que el archivo no carga",
  ).toBe(0);
  expect(await page.evaluate(() => localStorage.getItem("chatSonido"))).toBe("1");

  await aCero(page);
  await page.getByRole("button", { name: "Volver a reproducir" }).click();
  await hastaElFinal(page);
  expect(await tonos(page), "CHAT-3: un ding por mensaje que entra").toEqual({
    muestras: 4,
    sintetizados: 0,
  });

  await page.getByRole("button", { name: "Silenciar" }).click();
  await aCero(page);
  await page.getByRole("button", { name: "Volver a reproducir" }).click();
  await hastaElFinal(page);
  expect(await tonos(page), "CHAT-3: silenciado es silenciado").toEqual({
    muestras: 0,
    sintetizados: 0,
  });
});

test("CHAT-5: si el archivo del ding no carga, la campana de respaldo suena igual", async ({ page }) => {
  await contarTonos(page);
  // El archivo desaparece, como si el despliegue se lo hubiera dejado.
  await page.route("**/*.mp3", (ruta) => ruta.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await reproducir(page);

  await page.getByRole("button", { name: "Con sonido" }).click();
  // La campana son dos parciales, así que cuenta por osciladores y no por
  // sonidos; lo que se comprueba es que suena, no cuántos osciladores usa.
  await expect
    .poll(async () => (await tonos(page)).sintetizados > 0, {
      message: "CHAT-5: sin archivo se queda muda",
      timeout: 10000,
    })
    .toBe(true);
  expect((await tonos(page)).muestras, "CHAT-5: no puede haber sonado el archivo").toBe(0);

  // Y sigue sonando el resto de la conversación, no sólo el primero.
  await aCero(page);
  await page.getByRole("button", { name: "Volver a reproducir" }).click();
  await hastaElFinal(page);
  expect(
    (await tonos(page)).sintetizados,
    "CHAT-5: sólo sonó el primero y el resto de la conversación se quedó callada",
  ).toBeGreaterThanOrEqual(4);
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
