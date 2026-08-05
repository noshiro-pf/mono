import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import {
  eslintPluginTsDataForge,
  type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { repositoryRootPath } from '../../scripts/repository-root-path.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

export default [
  {
    ignores: [
      'docs/**',
      // test/dist_/ has its own tsconfigs (named/ and ambient/) and
      // type-checks the built dist/ output (see scripts/cmd/build.mts); it
      // is excluded from the package tsconfig, so the typed-linter cannot
      // parse it.
      'test/dist_/**',
      // src/global.mts is excluded from the package tsconfig (so ambient
      // globals don't leak into the named-import program), so the
      // typed-linter cannot parse it. The file is auto-generated and
      // not worth linting.
      'src/global.mts',
      // src/entry-point.mts is auto-generated (scripts/functions/
      // gen-entry-point.mts) and must re-export from './index.mjs' by
      // design, which conflicts with the no-restricted-imports rule.
      'src/entry-point.mts',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath, repositoryRootPath],
  }),

  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

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
    files: ['configs/**/*'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
    }),
  },

  {
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
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
  {
    files: ['samples/**'],
    // These samples document ts-type-forge's own types, so they are written
    // against plain TypeScript / the standard library. Rewriting them into
    // ts-data-forge's equivalents documents ts-data-forge instead, obscures
    // what the snippet is about, and makes a types-only package's examples
    // depend on a runtime library.
    rules: {
      // `n as Uint` is the point of every branded-number sample: it shows how
      // that type is constructed.
      'ts-data-forge/prefer-as-int': 'off',
      // `Array.isArray` / the `typeof x === 'object' && x !== null` shape are
      // what the JsonValue samples spell out on purpose.
      'ts-data-forge/prefer-arr-is-array': 'off',
      'ts-data-forge/prefer-is-non-null-object': 'off',
      // `parseFloat('invalid')` is the very API the NaNType sample exists to
      // illustrate.
      'ts-data-forge/prefer-num-safe-parse-float': 'off',
    } satisfies Partial<EslintTsDataForgeRules>,
  },
] satisfies readonly FlatConfig[];
