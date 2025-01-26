import { type EslintImportsRules } from '../types/index.mjs';

export const eslintImportsRules: EslintImportsRules = {
  // TypeScript を使っている場合このチェックは必要ない。
  'import/no-unresolved': 'off',

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
        '@testing-library/jest-dom/**',
        'react-dom/client',
        'preact/**',
        'immer/**',
        'firebase/*',
        'firebase-functions/**',
        'firebase-admin/**',
        '@blueprintjs/*',
        '@material-ui/**',
        '@mui/material/**',
        '@fontsource/**',
        'resize-observer/lib/ResizeObserverEntry',
        'vitest/config',
        '*/index.mjs',
        '*/index.js',
        'zx/globals',
      ],
    },
  ],
  'import/no-webpack-loader-syntax': 'error',
  'import/no-self-import': 'error',
  'import/no-cycle': 'error',
  'import/no-useless-path-segments': 'error',
  'import/no-relative-parent-imports': 'off',

  // relates to @typescript-eslint/consistent-type-imports rule
  'import/consistent-type-specifier-style': ['error', 'prefer-inline'],

  'import/no-relative-packages': 'error',

  // helpfulWarnings
  'import/export': 'error',
  'import/no-named-as-default': 'error',
  'import/no-named-as-default-member': 'error',

  // prefer @typescript-eslint/no-deprecated
  // https://github.com/import-js/eslint-plugin-import/issues/1532
  'import/no-deprecated': 'off',

  'import/no-extraneous-dependencies': 'off',
  'import/no-mutable-exports': 'error',
  // 'import/no-unused-modules': ['error', { unusedExports: true }],
  'import/no-unused-modules': 'off',

  // moduleSystems
  'import/unambiguous': 'error',
  'import/no-commonjs': 'off',
  'import/no-amd': 'error',
  'import/no-nodejs-modules': 'off',
  'import/no-import-module-exports': 'off',

  // styleGuide
  'import/first': ['error', 'absolute-first'],
  'import/exports-last': 'off',
  'import/no-duplicates': 'error',
  'import/no-namespace': 'off',
  'import/extensions': [
    'error',
    'never',
    {
      pattern: { json: 'always', mjs: 'always' },
    },
  ],

  'import/order': 'off',
  // 'import/order': [
  //   'error',
  //   {
  //     groups: [], // using prettier-plugin-organize-imports
  //     'newlines-between': 'never',
  //   },
  // ],

  'import/newline-after-import': [
    'error',
    {
      considerComments: true,
      count: 1,
    },
  ],
  'import/prefer-default-export': 'off',
  'import/max-dependencies': 'off',
  'import/no-unassigned-import': [
    'error',
    {
      allow: [
        '**/*.css',
        '@testing-library/jest-dom/**',
        'solid-js',
        'zx/globals',
      ],
    },
  ],
  'import/no-named-default': 'off',

  /** Default export は定義側のリネームが import する側に反映されないので禁止 */
  'import/no-default-export': 'error',

  'import/no-named-export': 'off',
  'import/no-anonymous-default-export': 'error',
  'import/group-exports': 'off',
  'import/dynamic-import-chunkname': 'error',
  'import/no-empty-named-blocks': 'error',

  // deprecated rules
  'import/imports-first': 0,
} as const;
