import { defineConfig, devices } from "@playwright/test";

// E2E runs on its own ports so it never touches `npm run dev` (3000/3333).
// Both servers start for the run and stop with it.
const WEB_URL = "http://localhost:3100";
const API_URL = "http://localhost:3433";
const TEST_DATABASE_URL = "postgres://ruby:ruby@localhost:5433/ruby_test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: {
    baseURL: WEB_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Migrations first, so the API never starts against an empty ruby_test.
      name: "api",
      command: "npm run db:migrate -w @ruby/db && npm run start -w @ruby/api",
      cwd: "../..",
      url: `${API_URL}/health`,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        DATABASE_URL: TEST_DATABASE_URL,
        API_URL,
        WEB_URL,
        BETTER_AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-e2e!",
        GOOGLE_CLIENT_ID: "e2e-google-client-id",
        GOOGLE_CLIENT_SECRET: "e2e-google-client-secret",
        NODE_ENV: "test",
      },
    },
    {
      // A production build: `next dev` holds a per-project lock that would
      // clash with the owner's dev server, and `next build` leaves .next/dev alone.
      name: "web",
      command: "npx next build && npx next start --port 3100",
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: 300_000,
      env: { NEXT_PUBLIC_API_URL: API_URL },
    },
  ],
});
