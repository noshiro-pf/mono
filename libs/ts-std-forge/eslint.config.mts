import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsDataForge.configs.recommended,

  eslintConfigForVitest(),

  {
    // This package wraps the legacy Date API itself: constructing `Date`
    // values is the point of these files, and Temporal is not a substitute
    // for the API under test. A `Date` in one of the guard tests is there for
    // the same reason — it is the sample value that is an object but not a
    // record.
    files: ['test/**/*.mts', '**/*.test.mts', 'src/safe-date/**'],
    rules: defineKnownRules({
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    // The tests colocated under `src/` arrived with the ADT core in the D-49
    // port. They are the same files that linted clean beside their source in
    // ts-data-forge, whose config loosens these four for a test file — the
    // ones needed here, out of the longer list it carries. What each stands
    // for: a test asserts inside the branch it is testing, states its
    // expectation through a helper as often as through `expect`, keeps a
    // one-off fixture next to the case that uses it, and names the types it
    // is pinning even where the source would not.
    files: ['test/**/*.mts', '**/*.test.mts'],
    rules: defineKnownRules({
      'vitest/no-conditional-expect': 'off',
      'vitest/expect-expect': 'off',
      'unicorn/consistent-function-scoping': 'off',
      '@typescript-eslint/no-restricted-types': 'off',
    }),
  },

  {
    // `samples/` is embedded verbatim into the JSDoc by `doc:embed`, so each
    // file is written to read as documentation: it names the value it just
    // built before asserting on it, which is a comparison the checker can see
    // through, and it demonstrates a mutable record by mutating one. The
    // internal-module import is how a sample reaches a type that the entry
    // point does not re-export.
    files: ['samples/**'],
    rules: defineKnownRules({
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'functional/immutable-data': 'off',
      'import-x/no-internal-modules': 'off',
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-await-in-loop': 'off',
      'import-x/no-internal-modules': 'off',
      'import-x/no-default-export': 'off',
    }),
  },
  {
    files: ['configs/**/*'],
    rules: defineKnownRules({
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
    // What this keeps out is the number brands (Sumi D-26 / D-39): `Int`,
    // `FiniteNumber`, `SafeUint` and the rest must not appear here at all —
    // neither as a parameter type (a cast burden on every call site) nor as a
    // return type (Sumi refined's native `Int` will supersede it). It is
    // written as an allowlist because that is the direction that stays right
    // as ts-type-forge grows: a brand added upstream is refused without this
    // list having to hear about it.
    //
    // The allowlist is therefore what the package legitimately uses, and it
    // is not a global fallback — this package compiles with `types: []`, so a
    // ts-type-forge type is only in scope if the file imports it. Two groups:
    // the literal-range types that refine a parameter to a finite set of
    // numbers, and the record and type-level utilities that the ADT core and
    // the guards arrived with in the D-49 port. Neither group carries a
    // brand.
    files: ['src/**', 'test/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'ts-type-forge',
              allowImportNames: [
                'Index',
                'IndexInclusive',
                'NegativeIndex',
                'IntRange',
                'IntRangeInclusive',
                'UintRange',
                'UintRangeInclusive',

                'MutableRecord',
                'ReadonlyRecord',
                'RelaxedExclude',
                'TypeEq',
                'TypeExtends',
                'UnknownRecord',
                'ValueOf',
              ],
              message:
                'ts-std-forge imports only the literal-range types and the record / type-level utilities from ts-type-forge; branded number types are not used here (Sumi D-26 / D-39).',
            },
          ],
        },
      ],
    }),
  },
  {
    files: ['src/entry-point.mts'],
    rules: defineKnownRules({
      'no-restricted-imports': 'off',
      '@stylistic/padding-line-between-statements': 'off',
    }),
  },
] satisfies readonly FlatConfig[];
