import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import {
  eslintPluginTsTypeForge,
  type EslintTsTypeForgeRules,
} from 'eslint-plugin-ts-type-forge';

const thisDir = import.meta.dirname;

export default [
  {
    ignores: [
      'docs/**',
      'test-code/**',
      // test/dist_/ has its own tsconfig and type-checks the built dist/
      // output (see scripts/cmd/build.mts); it is excluded from the root
      // tsconfig, so the typed-linter cannot parse it.
      'test/dist_/**',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    // The monorepo root carries the shared toolchain devDependencies.
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    files: ['src/**/*.mts', 'samples/**/*.mts'],
    rules: defineKnownRules({
      'import-x/no-unassigned-import': 'off',
    }),
  },

  {
    files: ['test/**/*.mts', '**/*.test.mts'],
    rules: defineKnownRules({
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'import-x/no-internal-modules': 'off',
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
      'import-x/no-unused-modules': 'off',
    }),
  },
  {
    // The package entry point intentionally re-exports the generated `src/index.mts` barrel.
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
    }),
  },

  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'import-x/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
    }),
  },
  {
    // This sample documents the `Record<string, unknown>` -> `UnknownRecord`
    // codemod, so it has to show the built-in `Record` in its "before" code.
    files: ['samples/readme/replace-record-with-unknown-record-example.mts'],
    rules: {
      'ts-type-forge/prefer-readonly-or-mutable-record': 'off',
    } satisfies Partial<EslintTsTypeForgeRules>,
  },
] satisfies readonly FlatConfig[];
