import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
  restrictedSyntax,
} from 'eslint-config-typed';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { projectRootPath } from '../../tools/scripts/project-root-path.mjs';
import { restrictedImports } from './configs/eslint/rules/eslint-no-restricted-imports-option.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

export default [
  {
    ignores: ['docs/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath, projectRootPath],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    rules: defineKnownRules({
      'import-x/no-unused-modules': 'off',
      'no-restricted-imports': ['error', ...restrictedImports],
      'unicorn/prefer-temporal': ['warn', {}], // todo
      /* `range` takes branded integers, so its arguments are wrapped casts
         (`asUint32(n)`) and often negative literals — both of which this rule
         calls "complex", forcing a throwaway variable per loop. Disabled
         upstream in eslint-config-typed too; drop this once that release
         lands here. */
      'unicorn/no-unreadable-for-of-expression': 'off',
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
      // Tests often assert conditionally and may omit explicit expectations in helper-driven flows
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': 'off',
      'unicorn/consistent-function-scoping': 'off',

      /* A test file is a leaf: nothing imports it, so an `export` there is
         either dead code or a way to dodge the unused-variable check. The
         latter is what type-level assertion helpers used to do — they are
         plain `const`s now, referenced by a test that calls them. The base
         entries are spread back in because a flat-config override replaces
         the whole option array. */
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntax,
        {
          selector:
            'ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration',
          message:
            'Test files must not export. Keep helpers local and reference them from a test; move anything genuinely shared into a non-test module.',
        },
      ],
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
      // ts-repo-utils' API surface still references `Result` as an ambient
      // type. Until that is migrated to named imports, type narrowing of
      // its return values reports as `any` here.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
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
      'unicorn/prefer-number-is-safe-integer': 'off',
    }),
  },
  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
      'import-x/export': 'off',
      '@stylistic/padding-line-between-statements': 'off',
    }),
  },

  {
    files: ['samples/**'],
    rules: defineKnownRules({
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
