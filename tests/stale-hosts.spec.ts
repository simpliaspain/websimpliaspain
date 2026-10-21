/**
 * No source file may point at a host we no longer run.
 *
 *   STALE-HOST-1
 *     The n8n server moved, but the chat widget and the contact form kept
 *     posting to the old host, hardcoded in two files. It refused every
 *     connection, so for three weeks every chat message and every contact
 *     form submission went nowhere - and nothing failed loudly. The webhooks
 *     now live in src/lib/site.ts; this check fails if a retired host appears
 *     anywhere in the source again.
 *
 * A plain string scan: no browser, no network, deterministic. Add a host to
 * RETIRED_HOSTS whenever a server is decommissioned.
 */
import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RETIRED_HOSTS = ["nlhico"];

const HERE = fileURLToPath(import.meta.url);
const ROOT = join(dirname(HERE), "..");
const SCAN = ["src", "public", "scripts", ".github", "index.html", "404.html", "vite.config.ts", "playwright.config.ts"];
const TEXT = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".json", ".html", ".css", ".md", ".txt", ".xml", ".yml", ".yaml", ".svg", ".webmanifest", ""]);
const SELF = relative(ROOT, HERE);

function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isDirectory()) return readdirSync(path).flatMap((name) => files(join(path, name)));
  return TEXT.has(extname(path).toLowerCase()) ? [path] : [];
}

test("STALE-HOST-1: no source file references a retired host", () => {
  const candidates = [
    ...SCAN.flatMap((p) => files(join(ROOT, p))),
    ...readdirSync(ROOT).filter((name) => name.toLowerCase().endsWith(".md")).map((name) => join(ROOT, name)),
  ].filter((f) => relative(ROOT, f) !== SELF);
  expect(candidates.length, "scanned some files").toBeGreaterThan(50);

  const hits: string[] = [];
  for (const file of candidates) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const host of RETIRED_HOSTS) if (line.toLowerCase().includes(host)) hits.push(`${relative(ROOT, file)}:${i + 1} ${host}`);
    });
  }
  expect(hits, "references to retired hosts").toEqual([]);
});
