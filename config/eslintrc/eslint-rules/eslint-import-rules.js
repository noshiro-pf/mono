'use strict';

const { join } = require('path');

// @ts-check

/** @typedef { import("./rules-type/eslint-import-rules").EslintImportsRules } EslintImportsRules */

/** @type {EslintImportsRules} */
const eslintImportsRules = {
  // staticAnalysis
  'import/no-unresolved': [
    'error',
    { commonjs: true, caseSensitiveStrict: true },
  ],
  'import/named': 'off',
  'import/default': 'error',
  'import/namespace': 'error',
  'import/no-restricted-paths': 'off', // TODO
  'import/no-absolute-path': 'error',
  'import/no-dynamic-require': 'error',
  'import/no-internal-modules': [
    'error',
    {
      allow: [
        'rxjs/operators',
        'solid-js/web',
        '@testing-library/jest-dom/extend-expect',
        'react-dom/client',
        'preact/**',
        'immer/**',
        'firebase/*',
        'firebase-functions/**',
        '@blueprintjs/*',
        '@material-ui/*',
        'resize-observer/lib/ResizeObserverEntry',
      ],
    },
  ],
  'import/no-webpack-loader-syntax': 'error',
  'import/no-self-import': 'error',
  'import/no-cycle': 'error',
  'import/no-useless-path-segments': 'error',
  'import/no-relative-parent-imports': 'off',
  'import/no-relative-packages': 'error',

  // helpfulWarnings
  'import/export': 'error',
  'import/no-named-as-default': 'error',
  'import/no-named-as-default-member': 'error',

  // prefer eslint-plugin-deprecation
  // https://github.com/import-js/eslint-plugin-import/issues/1532
  'import/no-deprecated': 'off',

  'import/no-extraneous-dependencies': [
    'error',
    {
      packageDir: [join(__dirname, '../../../'), '.'],
    },
  ],
  'import/no-mutable-exports': 'error',
  'import/no-unused-modules': 'error',

  // moduleSystems
  'import/unambiguous': 'error',
  'import/no-commonjs': 'off',
  'import/no-amd': 'error',
  'import/no-nodejs-modules': 'off',
  'import/no-import-module-exports': 'off',

  // styleGuide
  'import/first': 'error',
  'import/exports-last': 'off',
  'import/no-duplicates': 'error',
  'import/no-namespace': ['error', { ignore: ['@noshiro/io-ts'] }],
  'import/extensions': [
    'error',
    'never',
    {
      pattern: { json: 'always' },
    },
  ],
  'import/order': 'off', // using prettier-plugin-organize-imports
  'import/newline-after-import': 'error',
  'import/prefer-default-export': 'off',
  'import/max-dependencies': 'off',
  'import/no-unassigned-import': [
    'error',
    {
      allow: [
        '**/*.css',
        '@testing-library/jest-dom/extend-expect',
        'solid-js',
      ],
    },
  ],
  'import/no-named-default': 'off',

  /**
   * default export は定義側のリネームが import する側に反映されないので禁止
   */
  'import/no-default-export': 'error',

  'import/no-named-export': 'off',
  'import/no-anonymous-default-export': 'error',
  'import/group-exports': 'off',
  'import/dynamic-import-chunkname': 'error',

  // deprecated rules
  'import/imports-first': 'off',
};

module.exports = { eslintImportsRules };
