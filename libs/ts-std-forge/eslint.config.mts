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
    // for the API under test.
    files: ['test/**/*.mts', 'src/safe-date/**'],
    rules: defineKnownRules({
      'unicorn/prefer-temporal': 'off',
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
    // ts-std-forge does not use branded number types (Tsubu D-26 / D-39):
    // the only things it imports from ts-type-forge are the literal-range
    // types that refine a parameter to a finite set of numbers. Every other
    // ts-type-forge type is available as a global, and a number brand
    // (`Int`, `FiniteNumber`, `SafeUint`, ...) must not appear here at all —
    // neither as a parameter type (a cast burden on every call site) nor as a
    // return type (Tsubu refined's native `Int` will supersede it).
    files: ['src/**', 'test/**'],
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': [
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
              ],
              message:
                'ts-std-forge imports only the literal-range types from ts-type-forge; branded number types are not used here (Tsubu D-26 / D-39).',
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
