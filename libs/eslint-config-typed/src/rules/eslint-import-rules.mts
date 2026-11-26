import { allExtensionsStr } from '../constants/index.mjs';
import { withDefaultOption, type EslintImportsRules } from '../types/index.mjs';

export const eslintImportsRules = {
  // Not needed when using TypeScript.
  'import-x/no-unresolved': 'off',

  // The following import-x resolution rules are redundant when using TypeScript:
  // the type-checker already reports missing named / default imports and invalid
  // namespace member access (TS2339). They also build large ExportMaps that are
  // slow and memory-heavy (a known cause of ESLint OOM on large codebases), so
  // keep them off for TypeScript.
  'import-x/named': 'off',
  'import-x/default': 'off',
  'import-x/namespace': 'off',
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
        'ts-data-forge/array',
        'ts-data-forge/number',
        'solid-js/web',
        '@testing-library/jest-dom/**',
        'react-dom/client',
        'react-dom/server',
        'preact/**',
        'immer/**',
        'firebase/*',
        'firebase-admin/*',
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

  // Neither option fits: the style is `import type { A }` when every binding is
  // a type and `import { a, type B }` otherwise, which
  // @typescript-eslint/consistent-type-imports,
  // @typescript-eslint/no-import-type-side-effects and import-x/no-duplicates
  // (prefer-inline) enforce together.
  'import-x/consistent-type-specifier-style': 'off',

  'import-x/no-relative-packages': withDefaultOption('error'),

  // helpfulWarnings
  // Redundant with TypeScript: duplicate / conflicting exports are reported as
  // TS2323 / TS2528.
  'import-x/export': 'off',
  'import-x/no-named-as-default': 'error',
  // Redundant with TypeScript: accessing a named export through the default
  // import is already a type error.
  'import-x/no-named-as-default-member': 'off',

  // prefer @typescript-eslint/no-deprecated (raised in import-js/eslint-plugin-import#1532)
  'import-x/no-deprecated': 'off',

  'import-x/no-extraneous-dependencies': 'off',
  'import-x/no-mutable-exports': 'error',

  // TODO: https://github.com/noshiro-pf/mono/issues/98
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
  'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
  'import-x/no-namespace': 'off',
  'import-x/extensions': [
    'error',
    'never',
    {
      pattern: { json: 'always', mjs: 'always' },
      // `./a.js` is how a `.ts` / `.tsx` module is imported under Node16 /
      // NodeNext resolution, and `./a.jsx` how a `.tsx` one is under
      // `jsx: preserve`. Since v4.18 the rule reads such an extension as
      // written rather than as resolved, so `never` would forbid it, while
      // `js: 'always'` would also demand `.js` of every extensionless import of
      // a `.ts` file (inferred through the resolver's alias). So an import
      // written with either extension is not checked at all, and an
      // extensionless one still is. That also accepts what v4.17 reported: a
      // `.js` on a real JavaScript file reachable without it, and on a package
      // subpath. `matchBase` matches the file name, at any depth of `../`.
      pathGroupOverrides: [
        {
          pattern: '*.{js,jsx}',
          patternOptions: { matchBase: true },
          action: 'ignore',
        },
      ],
    },
  ],

  'import-x/order': 'off', // Covered by prettier-plugin-organize-imports
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
      considerComments: false, // Must be false for consistency with the @stylistic/padding-line-between-statements rule
      count: 1,
    },
  ],

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
  'import-x/prefer-default-export': 'off',

  'import-x/no-named-export': 'off',
  // Covered by unicorn/no-anonymous-default-export, and every default export by
  // import-x/no-default-export
  'import-x/no-anonymous-default-export': 'off',
  'import-x/group-exports': 'off',

  'import-x/dynamic-import-chunkname': 'off',

  'import-x/no-empty-named-blocks': 'error',

  // Covered by unicorn/prefer-node-protocol
  // 'import/enforce-node-protocol-usage': ['error', 'always'],

  'import-x/no-rename-default': withDefaultOption('error'),

  // Covered by react-coding-style/import-style
  'import-x/prefer-namespace-import': 'off',
  // 'import-x/prefer-namespace-import': ['error', { patterns: ['react'] }],

  // Added in v4.18.

  /**
   * Barrel files are the convention here — `pnpm run gen:index` generates an
   * `index.mts` for every directory, and other directories import through it
   * (`import-x/no-internal-modules`). The same reason keeps
   * `unicorn/no-barrel-files` off.
   */
  'import-x/avoid-barrel-files': 'off',
  'import-x/avoid-importing-barrel-files': 'off',

  /** The generated barrels are `export * from …` throughout. */
  'import-x/avoid-re-export-all': 'off',

  /**
   * Covered more precisely by `tree-shakable/import-star`, which reports only a
   * namespace object used in a way that defeats tree-shaking; `import * as fs
   * from 'node:fs'` with member access is not one.
   */
  'import-x/avoid-namespace-import': 'off',

  // deprecated rules
  'import-x/imports-first': 0,
} as const satisfies EslintImportsRules;
