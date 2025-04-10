import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options';

import * as dotenv from 'dotenv'
dotenv.config();

/**
 * Global settings (shared for all projects)
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<TestOptions>({
  globalTimeout: 70000,
  timeout: 40000,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, /* Fail the build on CI if you accidentally left test.only in the source code. */
  retries: process.env.CI ? 2 : 1,  /* Retry on CI only */
  workers: process.env.CI ? 1 : undefined,  /* Opt out of parallel tests on CI. */
  reporter: 'html',   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  
  /* Runtime settings */
  use: {
    baseURL: '/',
    customEnvironmentVariable: 'anyURL',  // created on test-options.ts
    trace: 'on',
    extraHTTPHeaders: {
      'Authorization': `Token ${process.env.ACCESS_TOKEN}`
    }
    /*proxy: 
    {
      server: 'http://myproxy.com:3128',
      bypass: 'localhost'
    }*/
    //actionTimeout: 5000,
    //navigationTimeout: 5000,
  },
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),

  /**
   * Project specific settings
   * See https://playwright.dev/docs/test-configuration.
   */
  projects: [
    {
      name: 'setup',
      testMatch: 'auth.setup.ts'
    },
    {
      name: 'articleSetup',
      testMatch: 'newArticle.setup.ts',
      dependencies: ['setup'],
      teardown: 'articleCleanUp'
    },
    {
      name: 'articleCleanUp',
      testMatch: 'articleCleanUp.setup.ts'
    },
    {
      name: 'likeCounter',
      testMatch: 'likesCounter.spec.ts',
      use: { 
        storageState: '.auth/user.json'
      },
      dependencies: ['articleSetup']
    },
    {
      name: 'likeCounterGlobal',
      testMatch: 'likesCounterGlobal.spec.ts',
      use: { 
        storageState: '.auth/user.json'
      },
      dependencies: ['articleSetup']
    },
    {
      name: 'dev',
      use: { 
        browserName: 'chromium', 
        storageState: '.auth/user.json',
        baseURL: 'http://localhost:4200'
      },
      dependencies: ['setup'], // run 'setup' project first
    },
    {
      name: 'regression',
      testIgnore: 'likesCounter.spec.ts',
      use: { 
        browserName: 'chromium', 
        storageState: '.auth/user.json',
        baseURL: 'http://localhost:4200'
      },
      dependencies: ['setup'], // run 'setup' project first
    },
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium', 
        storageState: '.auth/user.json',
        baseURL: 'http://localhost:4200',
      },
      dependencies: ['setup'], // run 'setup' project first
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox', 
        storageState: '.auth/user.json',
        baseURL: 'http://localhost:4200',
      },
      dependencies: ['setup'] // before running this browser project we need to run the 'setup' project
    },
    {
      name: 'pageObjectFullScreen',
      testMatch: 'usePageObjects.spec.ts',
      use: { 
        browserName: 'firefox', 
        baseURL: 'http://localhost:4200',
        video: 
        {
          mode: 'retain-on-failure',
          size: {width:1920, height:1080}
        },
        viewport: { width: 1280, height: 720 }
      }
    }
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
