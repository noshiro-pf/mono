import { withDefaultOption, type EslintImportsRules } from '../types/index.mjs';
import { allExtensionsStr } from './all-extensions.mjs';

export const eslintImportsRules = {
  // Not needed when using TypeScript.
  'import-x/no-unresolved': 'off',

  // TypeScript compilation already ensures that named imports exist in the referenced module
  'import-x/named': 'off',

  'import-x/default': 'error',
  'import-x/namespace': withDefaultOption('error'),
  'import-x/no-restricted-paths': 'off', // TODO
  'import-x/no-absolute-path': withDefaultOption('error'),
  'import-x/no-dynamic-require': withDefaultOption('error'),
  'import-x/no-internal-modules': [
    'error',
    {
      allow: [
        `*/index.{${allExtensionsStr}}`,
        `./index.{${allExtensionsStr}}`,
        'rxjs/operators',
        'solid-js/web',
        '@testing-library/jest-dom/**',
        'react-dom/client',
        'preact/**',
        'immer/**',
        'firebase/*',
        'firebase-functions/**',
        '@blueprintjs/*',
        '@material-ui/**',
        '@mui/material',
        '@fontsource/**',
        'resize-observer/lib/ResizeObserverEntry',
        'vitest/config',
        'zx/globals',
      ],
    },
  ],
  'import-x/no-webpack-loader-syntax': 'error',
  'import-x/no-self-import': 'error',
  'import-x/no-cycle': withDefaultOption('error'),
  'import-x/no-useless-path-segments': withDefaultOption('error'),
  'import-x/no-relative-parent-imports': 'off',

  // relates to @typescript-eslint/consistent-type-imports rule
  'import-x/consistent-type-specifier-style': ['error', 'prefer-inline'],

  'import-x/no-relative-packages': withDefaultOption('error'),

  // helpfulWarnings
  'import-x/export': 'error',
  'import-x/no-named-as-default': 'error',
  'import-x/no-named-as-default-member': 'error',

  // prefer @typescript-eslint/no-deprecated (raised in import-js/eslint-plugin-import#1532)
  'import-x/no-deprecated': 'off',

  'import-x/no-extraneous-dependencies': 'off',
  'import-x/no-mutable-exports': 'error',

  // TODO: https://github.com/noshiro-pf/eslint-config-typed/issues/98
  // 'import-x/no-unused-modules': ['error', { unusedExports: true }],
  'import-x/no-unused-modules': 'off',

  // moduleSystems
  'import-x/unambiguous': 'error',
  'import-x/no-commonjs': 'off',
  'import-x/no-amd': 'error',
  'import-x/no-nodejs-modules': 'off',
  'import-x/no-import-module-exports': 'off',

  // styleGuide
  'import-x/first': ['error', 'absolute-first'],
  'import-x/exports-last': 'off',
  'import-x/no-duplicates': withDefaultOption('error'),
  'import-x/no-namespace': 'off',
  'import-x/extensions': [
    'error',
    'never',
    {
      pattern: { json: 'always', mjs: 'always' },
    },
  ],

  'import-x/order': 'off', // using prettier-plugin-organize-imports
  // 'import-x/order': [
  //   'error',
  //   {
  //     groups: [],
  //     'newlines-between': 'never',
  //   },
  // ],

  'import-x/newline-after-import': [
    'error',
    {
      considerComments: true,
      count: 1,
    },
  ],
  'import-x/prefer-default-export': 'off',
  'import-x/max-dependencies': 'off',
  'import-x/no-unassigned-import': [
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
  'import-x/no-named-default': 'off',

  /**
   * Prohibit default exports as renaming on the definition side is not
   * reflected on the import side
   */
  'import-x/no-default-export': 'error',

  'import-x/no-named-export': 'off',
  'import-x/no-anonymous-default-export': withDefaultOption('error'),
  'import-x/group-exports': 'off',
  'import-x/dynamic-import-chunkname': withDefaultOption('error'),
  'import-x/no-empty-named-blocks': 'error',

  // Covered by unicorn/prefer-node-protocol
  // 'import/enforce-node-protocol-usage': ['error', 'always'],

  'import-x/no-rename-default': withDefaultOption('error'),
  'import-x/prefer-namespace-import': ['error', { patterns: ['react'] }],

  // deprecated rules
  'import-x/imports-first': 0,
} as const satisfies EslintImportsRules;
