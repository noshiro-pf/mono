import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  typescriptEslintRules,
  type FlatConfig,
} from 'eslint-config-typed';
import {
  eslintPluginTsDataForge,
  type EslintTsDataForgeRules,
} from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { repositoryRootPath } from '../../scripts/repository-root-path.mjs';
import { workspaceRootPath } from './scripts/workspace-root-path.mjs';

/**
 * A `no-restricted-types` entry that names the ts-type-forge replacements and
 * offers each of them as an editor suggestion. Deliberately not a `fixWith`:
 * picking between the two is a semantic decision, not a rename.
 */
const bannedInFavorOf = (
  ...alternatives: readonly [string, string]
): Readonly<{ message: string; suggest: readonly string[] }> => ({
  message: `Use ${alternatives.map((name) => `\`${name}\``).join(' or ')} from ts-type-forge instead.`,
  suggest: alternatives,
});

/**
 * The standard-library types this package exists to replace, mapped to the
 * replacements it defines.
 *
 * `Exclude` / `Extract` / `Omit` / `Pick` leave their second argument
 * unconstrained, so a member or key that is not part of the first one is
 * silently accepted and yields an empty result instead of the compile error
 * that would have pointed at it. `Record` says nothing about whether the
 * properties may be reassigned. Both gaps are exactly what `src/others/std.mts`
 * fills, so the sources here should be written in the filled-in versions.
 *
 * `eslint-plugin-ts-type-forge` ships the same enforcement as
 * `prefer-strict-or-relaxed-utility-type` / `prefer-readonly-or-mutable-record`,
 * but this package must not depend on the plugin that depends on it, so it is
 * spelled with the stock rule instead.
 */
const RESTRICTED_STD_TYPES = {
  Exclude: bannedInFavorOf('StrictExclude', 'RelaxedExclude'),
  Extract: bannedInFavorOf('StrictExtract', 'RelaxedExtract'),
  Omit: bannedInFavorOf('StrictOmit', 'RelaxedOmit'),
  Pick: bannedInFavorOf('StrictPick', 'RelaxedPick'),
  Record: bannedInFavorOf('ReadonlyRecord', 'MutableRecord'),
} as const;

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
    files: ['src/**'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            // A flat-config rule entry replaces the inherited options
            // wholesale, so the shared config's own bans have to be carried
            // over explicitly rather than merged by ESLint.
            ...typescriptEslintRules[
              '@typescript-eslint/no-restricted-types'
            ][1].types,
            ...RESTRICTED_STD_TYPES,
          },
        },
      ],
    }),
  },

  {
    // The type-level tests are exempt (this turns the rule off wholesale,
    // matching the entry that was already here): several of them assert what
    // the standard-library types do — `MutableRecord<string, number>` *is*
    // `Record<string, number>`, `UnknownRecord` is safer than
    // `Record<string, any>` — so spelling them in the replacements would make
    // the assertion tautological.
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
