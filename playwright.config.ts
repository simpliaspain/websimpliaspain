import { defineConfig } from "@playwright/test";

/**
 * Runs against the production build via `vite preview`, so the suite exercises
 * exactly what gets deployed rather than the dev server.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    // The first-visit chat prompt (ChatPrompt) appears after 8s on a page.
    // Every suite starts as a returning visitor so it never covers controls
    // or adds DOM changes mid-test; chat-prompt.spec.ts clears this.
    storageState: {
      cookies: [],
      origins: [{ origin: "http://localhost:4173", localStorage: [{ name: "chatPromptSeen", value: "1" }] }],
    },
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
