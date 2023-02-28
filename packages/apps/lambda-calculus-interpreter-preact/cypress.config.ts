import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '3w8af2',
  viewportWidth: 375,
  viewportHeight: 667,
  modifyObstructiveCode: false,
  pageLoadTimeout: 120000,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5180',
    // specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
