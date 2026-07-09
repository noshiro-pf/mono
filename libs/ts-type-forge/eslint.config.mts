import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: [
      '.eslintrc.cjs',
      'docs/**',
      'agents/**',
      // test/imports/ has its own tsconfig (tsconfig.named.json /
      // tsconfig.ambient.json) and is excluded from the root tsconfig
      // because the named-import side-effect-free assertions only hold
      // when src/global.mts is NOT in the program.
      'test/imports/**',
      // src/global.mts is excluded from the root tsconfig (so ambient
      // globals don't leak into the named-import program), so the
      // typed-linter cannot parse it. The file is auto-generated and
      // not worth linting.
      'src/global.mts',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintConfigForVitest(),

  {
    files: ['**/*.test.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      'unicorn/consistent-function-scoping': 'off',
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-unassigned-import': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
      'import-x/no-extraneous-dependencies': 'off',
    }),
  },
  {
    files: ['configs/**/*', '.markdownlint-cli2.mjs'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },

  {
    files: ['src/**'],
    rules: defineKnownRules({
      'import-x/no-unused-modules': ['error', { unusedExports: true }],
    }),
  },
  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
      'unicorn/no-immediate-mutation': 'off',
      // The samples embedded into JSDoc `@example` blocks are illustrative
      // snippets: keep them compact and allow doc-oriented patterns such as
      // branded-type casts (`as Int32`) that the library intentionally
      // demonstrates.
      '@stylistic/padding-line-between-statements': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      'total-functions/no-unsafe-type-assertion': 'off',
      'total-functions/no-partial-division': 'off',
      // `Number.isInteger` (not `isSafeInteger`) is the correct guard for the
      // non-safe integer brands (`Int`, `Uint`, ...) these samples document.
      'unicorn/prefer-number-is-safe-integer': 'off',
      // `x | 0` (truncate + wrap) is the idiomatic ToInt32 conversion that the
      // `Int32` sample intentionally demonstrates (`Math.trunc` does not wrap).
      'math/prefer-math-trunc': 'off',
      // `parseFloat('invalid')` / `String.fromCharCode` / `new Date()` are the
      // very APIs the corresponding samples (NaNType, Uint16, MonthIndexEnum)
      // exist to illustrate.
      'math/no-static-nan-calculations': 'off',
      'unicorn/prefer-code-point': 'off',
      'unicorn/prefer-temporal': 'off',
      // The `Mutable*` samples take mutable parameters on purpose — mutating
      // them is exactly what those samples demonstrate.
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
