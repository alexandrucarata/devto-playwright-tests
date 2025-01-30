import { defineConfig, devices } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, '.env'), override: true });

require('dotenv').config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    // API Test Project
    {
      name: 'API',
      testMatch: '**/tests/api_tests/*.spec.ts',
      use: {
        baseURL: process.env.DEV_API_URL || '',
      },
    },

    // E2E UI Test Project
    {
      name: 'UI',
      testMatch: '**/tests/e2e_tests/*.spec.ts',
      use: {
        baseURL: process.env.DEV_BASE_URL || '',
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
