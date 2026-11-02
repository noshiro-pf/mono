import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  eslintImportsRules,
  type FlatConfig,
  mergeRestrictedImportsOptions,
  restrictedSyntax,
} from 'eslint-config-typed';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import { restrictedImports } from './configs/eslint/rules/eslint-no-restricted-imports-option.mjs';
import { brandedNumberConfigs } from './scripts/gen-branded-number/config.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

const internalModulesAllowedInSrc = [
  ...eslintImportsRules['import-x/no-internal-modules'][1].allow,
  '**/array/impl/index.mjs',
  '**/num/impl/index.mjs',
] as const;

const arrObjectPattern = {
  // The barrel that exports the object and the entry point that re-exports it.
  regex: String.raw`(^|/)(array/index|entry-point)\.mjs$`,
  importNames: ['Arr'],
  allowTypeImports: true,
  message:
    "Import the functions with `import * as Arr from '<relative path>/array/impl/index.mjs'` instead, so that a bundle keeps only the ones it calls.",
} as const;

const numObjectPattern = {
  // The barrels that export the object and the entry point that re-exports it.
  regex: String.raw`(^|/)(num/index|number/index|entry-point)\.mjs$`,
  importNames: ['Num'],
  allowTypeImports: true,
  message:
    "Import the functions with `import * as Num from '<relative path>/number/num/impl/index.mjs'` instead, so that a bundle keeps only the ones it calls.",
} as const;

const [firstBrandedNumberName, ...otherBrandedNumberNames] =
  brandedNumberConfigs.map((config) => config.pascalName);

if (firstBrandedNumberName === undefined) {
  throw new Error('scripts/gen-branded-number/config.mts lists no type');
}

const brandedNumberObjectPattern = {
  regex: String.raw`(^|/)(number/index|entry-point)\.mjs$`,
  importNames: [firstBrandedNumberName, ...otherBrandedNumberNames],
  allowTypeImports: true,
  message:
    "Use the `as*` / `is*` function with plain arithmetic (`asUint32(n + 1)`) instead of the object: a bundle keeps the object whole, with every operator of the type. Mind that `as*` throws out of range where the object's operators saturate; clamp first (`Num.clamp`) where the bound can be reached.",
} as const;

const selfImportPattern = {
  // `tsconfig.build.json` has no `paths`, so the build would resolve a
  // self-import to `dist/`, which does not exist yet.
  regex: String.raw`^ts-data-forge(/|$)`,
  message:
    'Import the module by its relative path, not through the package name.',
} as const;

export default [
  {
    ignores: ['docs/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: workspaceRootPath,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [workspaceRootPath],
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
    /* `strict-lib-active.mts` sits under `test/` but is not a test: it holds
       one `@ts-expect-error` that stops compiling if the strict standard
       library stops being applied, and the `export` is what keeps that
       declaration from being an unused local. The no-export rule below is
       about test files, so it — and the loosened rules beside it — do not
       apply here. */
    ignores: ['test/strict-lib-active.mts'],
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
      // `Arr`'s and `Num`'s functions are reached through their own barrels;
      // see below.
      'import-x/no-internal-modules': [
        'error',
        { allow: [...internalModulesAllowedInSrc] },
      ],
    }),
  },
  {
    // Each branded number reads its operators from the module generated for
    // it; see `scripts/gen-branded-number/render.mts`.
    files: ['src/number/branded-types/*.mts', 'src/number/enum/*.mts'],
    rules: defineKnownRules({
      'import-x/no-internal-modules': [
        'error',
        { allow: [...internalModulesAllowedInSrc, '**/operators/*.mjs'] },
      ],
    }),
  },
  {
    // The library's own code must not go through the `Arr` or `Num` object:
    // esbuild keeps an imported namespace object whole once any member is
    // used, so `Obj` would carry every array function into a consumer's bundle.
    // Outside `src/number/`, the same holds for the branded-number objects.
    // `test/eslint-config.test.mts` checks that this is in effect.
    files: ['src/**/*.mts'],
    // The generated barrel re-exports `Arr` and `Num`, and `src/number/` has a
    // block of its own below; `entry-point.mts` has the rule off below.
    ignores: ['src/**/*.test.mts', 'src/index.mts', 'src/number/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImports[0], {
          patterns: [
            arrObjectPattern,
            numObjectPattern,
            brandedNumberObjectPattern,
            selfImportPattern,
          ],
        }),
      ],
    }),
  },
  {
    // A branded-number module may use another's object (`NegativeInt.abs`
    // uses `PositiveInt.fromNumber`).
    files: ['src/number/**/*.mts'],
    ignores: ['src/**/*.test.mts', 'src/number/index.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImports[0], {
          patterns: [arrObjectPattern, numObjectPattern, selfImportPattern],
        }),
      ],
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
      'import-x/no-internal-modules': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'functional/immutable-data': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
