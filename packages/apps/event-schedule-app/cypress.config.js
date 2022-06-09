const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportWidth: 375,
  viewportHeight: 667,
  modifyObstructiveCode: false,
  projectId: 'tf8zhh',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
