import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'ixxvs7',
  viewportWidth: 375,
  viewportHeight: 667,
  modifyObstructiveCode: false,
  pageLoadTimeout: 120_000,
  e2e: {
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5180',
    // specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
