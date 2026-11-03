import { eslintConfigOffForSumiCheck } from '@sumi-lang/cli';
import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  restrictedSyntax,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

export default [
  {
    ignores: [
      'docs/**',
      // test/dist_/ has its own tsconfig and type-checks the built dist/
      // output (see scripts/cmd/build.mts); it is excluded from the package
      // tsconfig, so the typed-linter cannot parse it.
      'test/dist_/**',
    ],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    // A type copied onto a new object by hand loses its prototype, and with it
    // the members a `Type` written as a class inherits (#3037), or calls its
    // lazy `defaultValue` getter; `copyTypeByDescriptors` in src/type.mts does
    // neither, and is the one place that copies descriptors. The base entries
    // are spread back in because a flat-config override replaces the whole
    // option array.
    files: ['src/**/*.mts'],
    ignores: ['src/type.mts', '**/*.test.mts'],
    rules: defineKnownRules({
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntax,
        {
          selector:
            "CallExpression[callee.object.name='Object'][callee.property.name=/^(defineProperties|getOwnPropertyDescriptors)$/]",
          message:
            'Copy a type with `copyTypeByDescriptors` (src/type.mts), which keeps its prototype and leaves a lazy `defaultValue` unevaluated.',
        },
      ],
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
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-fill-with-reference-type': 'off',
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
    files: ['configs/**/*'],
    rules: defineKnownRules({
      'import-x/no-default-export': 'off',
      'import-x/no-anonymous-default-export': 'off',
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

  // src/ is what `pnpm run check:sumi` checks (tsconfig.sumi.json), so the
  // ESLint rules Sumi covers are turned off there and a diagnostic is
  // answered by its `@sumi-expect-error` marker alone (D-46). Last, to win
  // the merge.
  {
    ...eslintConfigOffForSumiCheck,
    files: ['src/**'],
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
