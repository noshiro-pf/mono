import type { Linter } from 'eslint';
import { readGitignoreFiles } from 'eslint-gitignore';
import {
  eslintImportsRules,
  eslintNoshiroCustomRules,
  eslintRulesAll,
  typescriptEslintRules,
} from './eslintrc-base';

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
 */

// quotes: ['error', 'single', { avoidEscape: true }],

const config: Linter.Config = {
  extends: [
    /* recommended */
    'eslint:all',
    'plugin:@typescript-eslint/all',

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
    'prettier', // turn off rules
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
    project: './config/tsconfig/tsconfig.eslint.json',
  },
  rules: {
    ...eslintRulesAll.modifiedRules,
    ...eslintRulesAll.disabledRules,
    ...typescriptEslintRules.modifiedRules,
    ...typescriptEslintRules.disabledRules,
    ...eslintImportsRules.staticAnalysis,
    ...eslintImportsRules.helpfulWarnings,
    ...eslintImportsRules.moduleSystems,
    ...eslintImportsRules.styleGuide,
    ...eslintNoshiroCustomRules,
  },
  ignorePatterns: readGitignoreFiles({ cwd: __dirname }),
};

module.exports = config;
