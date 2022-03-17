'use strict';

const { join } = require('path');

// @ts-check

/** @typedef { import("./rules-record").LinterRulesRecord } LinterRulesRecord */

/**
 * @type {Readonly<{
 *   staticAnalysis: Partial<LinterRulesRecord>;
 *   helpfulWarnings: Partial<LinterRulesRecord>;
 *   moduleSystems: Partial<LinterRulesRecord>;
 *   styleGuide: Partial<LinterRulesRecord>;
 * }>}
 */
const eslintImportsRules = {
  staticAnalysis: {
    'import/no-unresolved': 'warn',
    'import/named': 'off',
    'import/default': 'warn',
    'import/namespace': 'warn',
    // 'import/no-restricted-paths': 'warn', // TODO
    'import/no-absolute-path': 'warn',
    'import/no-dynamic-require': 'error',
    'import/no-internal-modules': [
      'warn',
      {
        allow: [
          'rxjs/operators',
          'solid-js/web',
          '@testing-library/jest-dom/extend-expect',
          'preact/**',
          'immer/**',
          'firebase/*',
          '@blueprintjs/*',
          '@material-ui/*',
          'resize-observer/lib/ResizeObserverEntry',
        ],
      },
    ],
    'import/no-webpack-loader-syntax': 'warn',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'warn',
    'import/no-relative-parent-imports': 'off',
    'import/no-relative-packages': 'warn',
  },
  helpfulWarnings: {
    'import/export': 'warn',
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'warn',
    'import/no-deprecated': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'import/no-mutable-exports': 'warn',
    'import/no-unused-modules': 'warn',
  },
  moduleSystems: {
    'import/unambiguous': 'warn',
    'import/no-commonjs': 'off',
    'import/no-amd': 'warn',
    'import/no-nodejs-modules': 'off',
    'import/no-import-module-exports': 'off',
  },
  styleGuide: {
    'import/first': 'warn',
    'import/exports-last': 'off',
    'import/no-duplicates': 'warn',
    'import/no-namespace': 'warn',
    'import/extensions': 'warn',
    'import/order': 'off', // using prettier-plugin-organize-imports
    'import/newline-after-import': 'warn',
    'import/prefer-default-export': 'off',
    'import/max-dependencies': 'off',
    'import/no-unassigned-import': [
      'warn',
      {
        allow: [
          '**/*.css',
          '@testing-library/jest-dom/extend-expect',
          'solid-js',
        ],
      },
    ],
    'import/no-named-default': 'off',
    'import/no-default-export': 'warn',
    'import/no-named-export': 'off',
    'import/no-anonymous-default-export': 'warn',
    'import/group-exports': 'off',
    'import/dynamic-import-chunkname': 'warn',
  },
};

module.exports = eslintImportsRules;
