import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_STATE_PATH = path.join(__dirname, 'tests', '.auth-state.json');

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'list' : 'html',
  timeout: 60 * 1000,
  expect: { timeout: 5 * 1000 },

  globalSetup: './tests/global-setup.ts',

  use: {
    baseURL: process.env.BASE_URL || 'https://demo.b1.church',
    storageState: STORAGE_STATE_PATH,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    // Settings must run first — it renames the church, which website tests depend on
    {
      name: 'settings',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
      testMatch: /settings\.spec\.ts/,
    },
    // serving-plans must run before serving-lessons (lessons depends on ministry/plans/team data)
    {
      name: 'serving-plans',
      dependencies: ['settings'],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 1200 },
      },
      testMatch: /serving-plans\.spec\.ts/,
    },
    // serving-lessons depends on data created by serving-plans
    {
      name: 'serving-lessons',
      dependencies: ['serving-plans'],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 1200 },
      },
      testMatch: /serving-lessons\.spec\.ts/,
    },
    // All other tests run after settings completes
    {
      name: 'chromium',
      dependencies: ['settings'],
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        // Taller viewport prevents the sticky header from covering action buttons
        viewport: { width: 1280, height: 1200 },
      },
      testIgnore: /(settings|serving-plans|serving-lessons)\.spec\.ts/,
    },
  ],
});
