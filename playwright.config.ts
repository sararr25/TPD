import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "scripts/browser",
  workers: 1,
  timeout: 30000,
  use: { channel: "chrome", headless: true },
  outputDir: ".private/browser-results",
  reporter: "list",
});
