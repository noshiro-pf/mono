import type { Linter } from 'eslint';
import { readGitignoreFiles } from 'eslint-gitignore';
import { eslintImportsRules } from './eslintrc-base/eslint-import-rules';
import { eslintNoshiroCustomRules } from './eslintrc-base/eslint-noshiro-custom';
import { eslintRules } from './eslintrc-base/eslint-rules';
import { typescriptEslintRules } from './eslintrc-base/typescript-eslint-rules';

/**
 *  links
 *   - https://eslint.org/docs/rules/
 *   - https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
 *
 *  last update:
 *   "@typescript-eslint/eslint-plugin": "^4.14.1",
 *   "@typescript-eslint/parser": "^4.14.1",
 *   "eslint": "^7.18.0",
 *   "eslint-config-prettier": "^7.2.0",
 *   "eslint-plugin-import": "^2.22.1",
 *   "eslint-plugin-prettier": "^3.3.1",
 */

// quotes: ['error', 'single', { avoidEscape: true }],

const config: Linter.Config = {
  extends: [
    /* recommended */
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',

    /* import */
    'plugin:import/recommended',
    // 'plugin:import/errors',
    // 'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:import/react',
    'plugin:noshiro-custom/all',

    /* functional, total-functions */
    // 'plugin:functional/recommended',
    // 'plugin:functional/external-recommended',
    // 'plugin:total-functions/recommended',

    /* prettier */
    'plugin:prettier/recommended', // turn off rules
  ],
  root: true,
  env: { browser: true, node: true, es6: true },
  plugins: [
    '@typescript-eslint',
    'import',
    'noshiro-custom',
    /* functional, total-functions */
    // 'functional',
    // 'total-functions',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './config/tsconfig.eslint.json',
  },
  rules: {
    ...eslintRules.additionalRulesNotIncludedInRecommended.possibleErrors,
    ...eslintRules.additionalRulesNotIncludedInRecommended.bestPractices,
    ...eslintRules.additionalRulesNotIncludedInRecommended.variables,
    ...eslintRules.additionalRulesNotIncludedInRecommended.stylisticIssues,
    ...eslintRules.additionalRulesNotIncludedInRecommended.ECMAScript6,
    ...eslintRules.modifiedRulesIncludedInRecommended,
    ...eslintRules.disabledRulesIncludedInRecommended,
    ...typescriptEslintRules.additionalRulesNotIncludedInRecommended,
    ...typescriptEslintRules.modifiedRulesIncludedInRecommended,
    ...typescriptEslintRules.disabledRulesIncludedInRecommended,
    ...eslintImportsRules.staticAnalysis,
    ...eslintImportsRules.helpfulWarnings,
    ...eslintImportsRules.moduleSystems,
    ...eslintImportsRules.styleGuide,
    ...eslintNoshiroCustomRules,
  },
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
};

module.exports = config;
