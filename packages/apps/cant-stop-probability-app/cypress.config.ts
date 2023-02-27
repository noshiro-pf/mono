import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'zem8a1',
  viewportWidth: 375,
  viewportHeight: 667,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5180',
    // specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
