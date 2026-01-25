import { defineConfig, devices } from "playwright/test"

export default defineConfig({
  testDir: './testing/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\.e2e\.ts$/,
    },
  ],
  webServer: {
    command: `bun run start`,
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
