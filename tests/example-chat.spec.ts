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
 *   CHAT-3  pulsar «oír los mensajes» hace oír la conversación entera -un
 *           ding por mensaje-, se recuerda, y después silencia. Y lo que
 *           suena es el archivo del vídeo, no la campana de respaldo.
 *   CHAT-4  «volver a reproducir» sigue centrado bajo la tarjeta con el
 *           control del sonido al lado, y los dos no se solapan.
 *   CHAT-5  si el archivo del ding no carga, la campana de respaldo suena en
 *           su lugar - y en todos los mensajes, no sólo en el primero.
 *   CHAT-6  el control del sonido existe mientras la conversación se está
 *           reproduciendo. Antes esperaba a que terminara y tardaba 6,3 s en
 *           aparecer, así que no había con qué encenderlo a tiempo.
 *   CHAT-7  quien vuelve con el sonido encendido no recibe un botón que
 *           miente. La preferencia se guarda entre visitas y el permiso del
 *           navegador no, así que la conversación pasa muda; antes el botón
 *           ponía «Silenciar» encima de ese silencio. Ahora invita, y
 *           pulsarlo la hace sonar.
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

/**
 * Pone la tarjeta delante y espera a que la conversación termine. El final
 * se mide por «volver a reproducir», que es el único control que aparece al
 * acabar: el del sonido está desde el principio, así que esperar a que haya
 * *algún* botón en el pie ya no espera a nada.
 */
async function reproducir(page: Page) {
  await page.evaluate(() => document.getElementById("accion")?.scrollIntoView({ block: "center" }));
  await expect(page.getByRole("button", { name: "Volver a reproducir" })).toBeVisible({ timeout: 30000 });
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

test("CHAT-3: pulsar «oír los mensajes» hace oír la conversación, se recuerda y silencia", async ({ page }) => {
  await contarTonos(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await reproducir(page);

  // Pulsarlo no da una campanada suelta: vuelve a reproducir la conversación
  // con sonido, que es lo que quiere quien lo pulsa. Cuatro mensajes entran,
  // cuatro dings. Y son del archivo, no de la campana de respaldo: así un
  // archivo roto no puede esconderse detrás del respaldo.
  await page.getByRole("button", { name: "Oír los mensajes" }).click();
  await hastaElFinal(page);
  expect(await tonos(page), "CHAT-3: pulsarlo tiene que hacer oír los cuatro mensajes").toEqual({
    muestras: 4,
    sintetizados: 0,
  });
  expect(await page.evaluate(() => localStorage.getItem("chatSonido"))).toBe("1");

  // Ya con permiso, el botón sí es un interruptor y lo dice.
  await expect(page.getByRole("button", { name: "Silenciar" })).toBeVisible();

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

test("CHAT-6: el control del sonido existe mientras la conversación se reproduce", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await page.evaluate(() => document.getElementById("accion")?.scrollIntoView({ block: "center" }));

  // Mientras se reproduce no hay «volver a reproducir», y antes el control del
  // sonido tampoco: tardaba 6,3 s en existir, así que quien miraba la tarjeta
  // no tenía con qué encender el sonido hasta que ya había pasado todo.
  await expect(
    page.getByRole("button", { name: "Oír los mensajes" }),
    "CHAT-6: no hay con qué encender el sonido mientras la conversación pasa",
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: "Volver a reproducir" }),
    "CHAT-6: la conversación ya había acabado, así que esto no prueba nada",
  ).toBeHidden();
});

test("CHAT-7: quien vuelve con el sonido encendido no recibe un botón que miente", async ({ page }) => {
  await contarTonos(page);
  // La preferencia está guardada de una visita anterior. El permiso del
  // navegador no se guarda, así que esta visita todavía no puede sonar.
  await page.addInitScript(() => {
    try {
      localStorage.setItem("chatSonido", "1");
    } catch {
      /* da igual: lo que se comprueba es lo de abajo */
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("html[data-hydrated]");
  await reproducir(page);

  // La conversación ha pasado en silencio, y eso no se puede evitar: sin un
  // gesto el navegador no deja sonar nada. Lo que sí se puede evitar es
  // mentir sobre ello, que es lo que hacía antes.
  expect(await tonos(page), "CHAT-7: ha sonado sin gesto, o sea que la cuenta no mide nada").toEqual({
    muestras: 0,
    sintetizados: 0,
  });
  await expect(
    page.getByRole("button", { name: "Silenciar" }),
    "CHAT-7: dice «Silenciar» con la conversación muda - eso era el fallo",
  ).toBeHidden();

  // Y sigue habiendo una salida obvia: pulsar y oírla.
  await page.getByRole("button", { name: "Oír los mensajes" }).click();
  await hastaElFinal(page);
  expect(await tonos(page), "CHAT-7: pulsarlo tampoco la hace sonar").toEqual({
    muestras: 4,
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

  // La campana son dos parciales, así que cuenta por osciladores y no por
  // sonidos; lo que se comprueba es que suena, no cuántos osciladores usa.
  // Cuatro mensajes entran, así que con una campana por mensaje tiene que
  // haber al menos cuatro: eso descarta el fallo de que sonara sólo la
  // primera y el resto de la conversación se quedara callada.
  await page.getByRole("button", { name: "Oír los mensajes" }).click();
  await hastaElFinal(page);
  expect((await tonos(page)).muestras, "CHAT-5: no puede haber sonado el archivo").toBe(0);
  expect(
    (await tonos(page)).sintetizados,
    "CHAT-5: sin archivo la conversación se queda muda",
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
