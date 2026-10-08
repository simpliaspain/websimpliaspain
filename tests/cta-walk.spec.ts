/**
 * Every interactive element must do something.
 *
 * Three CTAs shipped as silent no-ops and were found only by using the site:
 * "Ver Demo en Acción" (an i18n key mismatch; broken for weeks in Spanish,
 * never worked in English), "Saber Más" (the same mismatch) and "Solicitar
 * Demo Gratis" (a bare <Button> with no handler and no link since the first
 * commit, on both service pages). None threw, so nothing caught them.
 *
 *   WALK-1  On every route, in both locales, every visible interactive element
 *           (links, buttons, [role=button], summary, submit) is activated in a
 *           real browser and must produce an observable effect: navigation,
 *           an external tab or request, a dialog, a scroll, or a DOM state
 *           change. A silent no-op fails, naming the element.
 *   WALK-2  The same for everything inside the main menu and the chat widget
 *           once they are open.
 *
 * How effects are read. No route mutates its DOM while idle (style attributes
 * aside - framer-motion writes those on scroll), so any non-style mutation
 * after a click is the click's doing. tel: and mailto: hand off to the OS and
 * leave nothing a browser can observe; for those the href is validated
 * instead. Every request that leaves localhost is aborted: outbound links are
 * seen as attempted navigations or popups, and the chat never reaches its
 * real webhook. Visually hidden controls that appear on focus (the marquee
 * pause) are activated from the keyboard, as a keyboard user would.
 *
 * WALK_REPORT=1 prints the full inventory (one JSON line per element).
 */
import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const ROUTES = ["/", "/chatbots-multicanal", "/agentes-telefonicos", "/contacto", "/politica-privacidad", "/ruta-que-no-existe"];
const LOCALES = ["es", "en"] as const;
const SEL = 'a[href], button, [role="button"], summary, input[type="submit"]';
const REPORT = !!process.env.WALK_REPORT;

type Item = { key: string; region: string; tag: string; name: string; href: string | null; target: string | null; hidden: boolean };
type Result = Item & { route: string; lang: string; scope: string; effect: string; detail: string };

async function setup(context: BrowserContext, lang: string) {
  await context.addInitScript((l) => localStorage.setItem("language", l), lang);
  await context.route("**/*", (route) => {
    const url = route.request().url();
    return url.startsWith("http://localhost:4173") ? route.continue() : route.abort();
  });
}

async function load(page: Page, route: string) {
  await page.goto(route);
  await page.waitForSelector("html[data-hydrated]");
}

/** Visible, enabled interactive elements, keyed so they can be found again after a reload. */
async function inventory(page: Page): Promise<Item[]> {
  return page.evaluate((sel) => {
    const seen = new Map<string, number>();
    const items: Item[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if ((el as HTMLButtonElement).disabled || el.closest("[inert], [aria-hidden='true']")) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const hidden = r.width <= 1 || r.height <= 1;
      if (hidden && !el.matches(".sr-only")) continue;
      const name = (el.getAttribute("aria-label") || el.innerText || (el as HTMLInputElement).value || "").replace(/\s+/g, " ").trim().slice(0, 60);
      const region = el.closest("#main-menu") ? "menu"
        : el.closest("header, nav") ? "header"
        : el.closest("footer") ? "footer"
        : (el.closest("section[id]") as HTMLElement | null)?.id || el.closest("section, [role=dialog], form")?.getAttribute("aria-labelledby") || (el.closest("main") ? "main" : "page");
      const href = el.getAttribute("href");
      const base = `${region}|${el.tagName}|${name}|${href ?? ""}`;
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      const key = `${base}#${n}`;
      items.push({ key, region, tag: el.tagName.toLowerCase(), name, href, target: el.getAttribute("target"), hidden });
    }
    return items;
  }, SEL);
}

async function locate(page: Page, key: string) {
  return page.evaluateHandle(({ sel, key }) => {
    const seen = new Map<string, number>();
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if ((el as HTMLButtonElement).disabled || el.closest("[inert], [aria-hidden='true']")) continue;
      const name = (el.getAttribute("aria-label") || el.innerText || (el as HTMLInputElement).value || "").replace(/\s+/g, " ").trim().slice(0, 60);
      const region = el.closest("#main-menu") ? "menu"
        : el.closest("header, nav") ? "header"
        : el.closest("footer") ? "footer"
        : (el.closest("section[id]") as HTMLElement | null)?.id || el.closest("section, [role=dialog], form")?.getAttribute("aria-labelledby") || (el.closest("main") ? "main" : "page");
      const base = `${region}|${el.tagName}|${name}|${el.getAttribute("href") ?? ""}`;
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      if (`${base}#${n}` === key) return el;
    }
    return null;
  }, { sel: SEL, key });
}

/** Wait until smooth scrolling (scroll-behavior: smooth) has come to rest. */
async function settle(page: Page) {
  let last = -1;
  for (let stable = 0, n = 0; stable < 3 && n < 40; n++) {
    await page.waitForTimeout(50);
    const y = await page.evaluate(() => window.scrollY);
    stable = y === last ? stable + 1 : 0;
    last = y;
  }
}

const STRONG = ["popup", "external", "navigation", "anchor", "dialog"];

/** Activate one element and report what it did. */
async function activate(page: Page, item: Item): Promise<{ effect: string; detail: string }> {
  if (item.href && /^(tel|mailto):/.test(item.href)) {
    const ok = item.href.startsWith("tel:") ? /^tel:\+?\d{9,15}$/.test(item.href.replace(/\s/g, "")) : /^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(item.href);
    return { effect: ok ? "protocol" : "none", detail: item.href };
  }
  const handle = (await locate(page, item.key)).asElement();
  if (!handle) return { effect: "none", detail: "element not found after reload" };

  // Fixed controls (header, chat button) do not move with the page; start
  // them from mid-page so a scroll-to-top is observable.
  const fixed = await handle.evaluate((el) => {
    for (let n: Element | null = el; n; n = n.parentElement) if (getComputedStyle(n).position === "fixed") return true;
    return false;
  });
  if (fixed) await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" as ScrollBehavior }));
  else if (item.hidden) await handle.focus();
  else await handle.scrollIntoViewIfNeeded();
  await settle(page);

  const before = await page.evaluate(() => {
    const w = window as unknown as { __walk: { mutations: number; mo?: MutationObserver } };
    w.__walk?.mo?.disconnect();
    w.__walk = { mutations: 0 };
    // Tooltips (hover) and Radix's data-state bookkeeping are not effects.
    const noise = (n: Node | null) => !!(n instanceof Element ? n : n?.parentElement)?.closest("[data-radix-popper-content-wrapper], [role=tooltip]");
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "attributes" && (m.attributeName === "style" || m.attributeName === "data-state")) continue;
        if (noise(m.target) || [...m.addedNodes, ...m.removedNodes].some(noise)) continue;
        w.__walk.mutations++;
      }
    });
    mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    w.__walk.mo = mo;
    return { scrollY: window.scrollY, dialogs: document.querySelectorAll("[role=dialog], [role=alertdialog]").length };
  });
  const startUrl = page.url();
  const popups: Page[] = [];
  const onPage = (p: Page) => popups.push(p);
  page.context().on("page", onPage);
  const outbound: string[] = [];
  const onRequest = (r: { isNavigationRequest(): boolean; url(): string }) => {
    if (r.isNavigationRequest() && !r.url().startsWith("http://localhost:4173")) outbound.push(r.url());
  };
  page.on("request", onRequest);

  if (item.hidden) {
    await page.keyboard.press("Enter");
  } else {
    await handle.click({ timeout: 3000 }).catch(async () => {
      // Covered by something (a fixed widget): fall back to the keyboard.
      await handle.focus();
      await page.keyboard.press("Enter");
    });
  }

  // Poll. A strong effect returns at once; a weak one (state, scroll) waits a
  // little longer in case it was only the prelude to one (a menu closing
  // before its link opens a tab).
  let weak: { effect: string; detail: string } | null = null;
  let weakAt = 0;
  let result: { effect: string; detail: string } = { effect: "none", detail: "" };
  for (let waited = 0; waited < 1500; waited += 100) {
    await page.waitForTimeout(100);
    if (popups.length) { result = { effect: "popup", detail: popups[0].url() }; break; }
    if (outbound.length) { result = { effect: "external", detail: outbound[0] }; break; }
    if (page.url() !== startUrl) {
      const a = new URL(startUrl), b = new URL(page.url());
      result = { effect: a.pathname === b.pathname ? "anchor" : "navigation", detail: b.pathname + b.hash };
      break;
    }
    const now = await page.evaluate(() => ({
      scrollY: window.scrollY,
      dialogs: document.querySelectorAll("[role=dialog], [role=alertdialog]").length,
      mutations: (window as unknown as { __walk: { mutations: number } }).__walk.mutations,
      invalid: document.activeElement instanceof HTMLElement && document.activeElement.matches(":invalid") ? document.activeElement.getAttribute("name") : null,
    }));
    if (now.dialogs > before.dialogs) { result = { effect: "dialog", detail: "" }; break; }
    if (!weak) {
      if (now.invalid) weak = { effect: "validation", detail: `focus to invalid "${now.invalid}"` };
      else if (Math.abs(now.scrollY - before.scrollY) > 2) weak = { effect: "scroll", detail: `${Math.round(before.scrollY)} -> ${Math.round(now.scrollY)}` };
      else if (now.mutations > 0) weak = { effect: "state", detail: `${now.mutations} DOM changes` };
      if (weak) weakAt = waited;
    } else if (waited - weakAt >= 500) { result = weak; break; }
  }
  if (result.effect === "none" && weak) result = weak;
  page.context().off("page", onPage);
  page.off("request", onRequest);
  for (const p of popups) await p.close();
  return result;
}

/** Returns true if the page is still on its route with nothing open. */
async function clean(page: Page, route: string) {
  const path = new URL(page.url()).pathname;
  if (path !== route) return false;
  return page.evaluate(() => document.querySelectorAll("[role=dialog], [role=alertdialog], #main-menu").length === 0);
}

async function walk(page: Page, route: string, lang: string, scope: "page" | "menu" | "chat") {
  const open = async () => {
    await load(page, route);
    if (scope === "menu") {
      await page.locator("#main-menu-trigger, [aria-controls='main-menu']").first().click();
      await page.locator("#main-menu").waitFor();
    }
    if (scope === "chat") {
      await page.getByRole("button", { name: lang === "es" ? "Abrir chat" : "Open chat", exact: true }).click();
      const input = page.locator("input[placeholder]").last();
      await input.waitFor();
      await input.fill(lang === "es" ? "Hola" : "Hello");
    }
  };
  await open();
  let items = await inventory(page);
  if (scope === "menu") items = items.filter((i) => i.region === "menu");
  if (scope === "chat") {
    await load(page, route);
    const closed = new Set((await inventory(page)).map((i) => i.key));
    await open();
    items = (await inventory(page)).filter((i) => !closed.has(i.key));
  }

  const results: Result[] = [];
  let dirty = false;
  for (const item of items) {
    if (dirty) { await open(); dirty = false; }
    const r = await activate(page, item);
    results.push({ ...item, route, lang, scope, ...r });
    if (REPORT) console.log(JSON.stringify({ route, lang, scope, region: item.region, tag: item.tag, name: item.name, href: item.href, target: item.target, effect: r.effect, detail: r.detail }));
    // Language toggle flips the locale; anything that navigated or opened
    // something is reset with a fresh load. So is a scroll: a jump can bring
    // the demo video into view, it autoplays, and its control relabels
    // itself ("Reproducir" -> "Pausar"), so it could no longer be found by
    // the name it was inventoried under.
    dirty = STRONG.includes(r.effect) || r.effect === "none" || r.effect === "scroll" || /language|idioma|english|español/i.test(item.name) || scope !== "page" || !(await clean(page, route));
  }
  return results;
}

for (const lang of LOCALES) {
  for (const route of ROUTES) {
    test.describe(`WALK ${lang} ${route}`, () => {
      test.use({ viewport: { width: 1440, height: 900 } });
      test.setTimeout(240_000);

      test(`WALK-1: every element on ${route} (${lang}) has an effect`, async ({ page, context }) => {
        await setup(context, lang);
        const results = await walk(page, route, lang, "page");
        expect(results.length, "found interactive elements").toBeGreaterThan(0);
        const dead = results.filter((r) => r.effect === "none").map((r) => `${r.region} <${r.tag}> "${r.name}" ${r.href ?? ""} ${r.detail}`);
        expect(dead, `silent no-ops on ${route} (${lang})`).toEqual([]);
      });

      if (route === "/") {
        for (const scope of ["menu", "chat"] as const) {
          test(`WALK-2: every element in the ${scope} (${lang}) has an effect`, async ({ page, context }) => {
            await setup(context, lang);
            const results = await walk(page, route, lang, scope);
            expect(results.length, `found ${scope} elements`).toBeGreaterThan(0);
            const dead = results.filter((r) => r.effect === "none").map((r) => `${r.region} <${r.tag}> "${r.name}" ${r.href ?? ""} ${r.detail}`);
            expect(dead, `silent no-ops in the ${scope} (${lang})`).toEqual([]);
          });
        }
      }
    });
  }
}

/**
 *   DEMO-REQ  "Solicitar Demo Gratis" on both service pages, both locales:
 *             mouse, Enter, Space and touch all reach /contacto by client-side
 *             navigation (no reload), with zero console errors.
 */
for (const lang of LOCALES) {
  for (const route of ["/chatbots-multicanal", "/agentes-telefonicos"]) {
    for (const how of ["mouse", "Enter", "Space", "touch"] as const) {
      test(`DEMO-REQ: "${lang === "es" ? "Solicitar Demo Gratis" : "Request Free Demo"}" on ${route} (${lang}) works by ${how}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: how === "touch", isMobile: false });
        await setup(context, lang);
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("console", (m) => {
          if (m.type() !== "error") return;
          // setup() aborts every request that leaves localhost; those aborts
          // are the test's doing, not the page's.
          const external = m.location().url && !m.location().url.startsWith("http://localhost:4173");
          if (external && m.text().startsWith("Failed to load resource")) return;
          errors.push(m.text());
        });
        page.on("pageerror", (e) => errors.push(String(e)));
        await load(page, route);
        await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
        const cta = page.getByRole("link", { name: lang === "es" ? "Solicitar Demo Gratis" : "Request Free Demo", exact: true });
        await cta.scrollIntoViewIfNeeded();
        if (how === "mouse") await cta.click();
        if (how === "touch") await cta.tap();
        if (how === "Enter" || how === "Space") { await cta.focus(); await page.keyboard.press(how); }
        await page.waitForURL("**/contacto");
        expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload), "client-side navigation, no reload").toBe(true);
        expect(errors, "no console errors").toEqual([]);
        await context.close();
      });
    }
  }
}

/**
 *   CARD-CTA  The multichannel card has two actions with a clear hierarchy:
 *             the contact CTA (filled, primary) and "Saber Más" (outline,
 *             secondary). Both are 44px tall and navigate client-side to the
 *             right place in both locales.
 */
for (const lang of LOCALES) {
  test(`CARD-CTA: the service card's contact and learn-more actions (${lang})`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await setup(context, lang);
    const page = await context.newPage();
    const names = lang === "es" ? { contact: "Hablemos de tu caso", more: "Saber Más" } : { contact: "Let's talk about your case", more: "Learn More" };
    for (const [name, path] of [[names.contact, "/contacto"], [names.more, "/chatbots-multicanal"]] as const) {
      await load(page, "/");
      await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));
      const link = page.locator("#servicios").getByRole("link", { name, exact: true });
      await link.scrollIntoViewIfNeeded();
      const box = await link.boundingBox();
      expect(box?.height, `${name}: 44px hit area`).toBeGreaterThanOrEqual(44);
      await link.click();
      await page.waitForURL(`**${path}`);
      expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload), `${name}: client-side`).toBe(true);
    }
    await load(page, "/");
    const bg = (name: string) => page.locator("#servicios").getByRole("link", { name, exact: true }).evaluate((el) => getComputedStyle(el).backgroundColor);
    const primary = await page.evaluate(() => { const d = document.createElement("div"); d.className = "bg-primary"; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; });
    expect(await bg(names.contact), "contact CTA is the filled primary").toBe(primary);
    expect(await bg(names.more), "learn more is not filled primary").not.toBe(primary);
    await context.close();
  });
}
