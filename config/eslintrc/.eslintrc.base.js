'use strict';

// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */

const {
  eslintImportsRules,
  eslintJestRules,
  // eslintNoshiroCustomRules,
  eslintFunctionalRules,
  eslintRulesAll,
  typescriptEslintRules,
  eslintPromiseRules,
} = require('./eslintrc-base');

/**
 *  - mono/docs/linter-formatter-update-manual.md
 *  - links
 *    - https://eslint.org/docs/rules/
 *    - https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
 *
 *  - last update:
 *    - "@types/eslint": "^8.4.1",
 *    - "@typescript-eslint/eslint-plugin": "^5.14.0",
 *    - "@typescript-eslint/parser": "^5.14.0",
 *    - "babel-eslint": "^10.1.0",
 *    - "eslint": "^8.11.0",
 *    - "eslint-config-preact": "^1.3.0",
 *    - "eslint-config-prettier": "^8.5.0",
 *    - "eslint-gitignore": "^0.1.0",
 *    - "eslint-import-resolver-typescript": "^2.5.0",
 *    - "eslint-plugin-array-func": "^3.1.7",
 *    - "eslint-plugin-functional": "^4.2.0",
 *    - "eslint-plugin-import": "^2.25.4",
 *    - "eslint-plugin-jest": "^26.1.1",
 *    - "eslint-plugin-promise": "^6.0.0",
 *    - "eslint-plugin-react": "^7.29.3",
 *    - "eslint-plugin-react-hooks": "^4.3.0",
 *    - "eslint-plugin-total-functions": "^5.0.1",
 *    - "prettier": "^2.5.1",
 *    - "prettier-plugin-organize-imports": "^2.3.4",
 *    - "prettier-plugin-packagejson": "^2.2.16",
 */

// quotes: ['error', 'single', { avoidEscape: true }],

/** @type {LinterConfig} */
const defaultConfig = {
  extends: [
    /* recommended */
    'eslint:all',
    'plugin:@typescript-eslint/all',

    /* import */
    'plugin:import/recommended',
    // 'plugin:import/errors',
    // 'plugin:import/warnings',
    'plugin:import/typescript', // needs eslint-import-resolver-typescript to be installed
    'plugin:import/react',

    /* functional, total-functions */
    // 'plugin:functional/external-recommended',
    // 'plugin:functional/recommended',
    // 'plugin:functional/stylistic',
    // 'plugin:total-functions/recommended',

    /* jest */
    'plugin:jest/all',
    // 'plugin:jest/recommended',

    /* array-func */
    'plugin:array-func/all',
    // 'plugin:array-func/recommended',

    /* prettier */
    'prettier', // turn off rules

    './.eslintrc.common-settings.js',
  ],
  rules: {
    ...eslintRulesAll.modifiedRules,
    ...eslintRulesAll.disabledRules,
    ...typescriptEslintRules.modifiedRules,
    ...typescriptEslintRules.disabledRules,
    ...eslintImportsRules.staticAnalysis,
    ...eslintImportsRules.helpfulWarnings,
    ...eslintImportsRules.moduleSystems,
    ...eslintImportsRules.styleGuide,
    ...eslintJestRules,
    ...eslintPromiseRules,
    ...eslintFunctionalRules,
    // ...eslintNoshiroCustomRules,
  },
};

module.exports = defaultConfig;
