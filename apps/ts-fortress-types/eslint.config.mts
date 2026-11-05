import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  eslintConfigForVitest,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { dateUtilsRules } from '../../tools/configs/eslint-date-utils.mjs';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

/**
 * Matches a call of `set<name>` or `setUTC<name>` with fewer than `minArgs`
 * arguments, whether the callee is `d.set…`, `d['set…']`, or either wrapped in
 * `!` or `as` (ESTree keeps no node for parentheses).
 */
const restrictedDateSetterCall = (name: string, minArgs: number): string =>
  `CallExpression[arguments.length<${minArgs}]:matches(${[
    'callee.property',
    'callee.expression.property',
  ]
    .flatMap((path) => [
      `[${path}.name=/^set(UTC)?${name}$/]`,
      `[${path}.value=/^set(UTC)?${name}$/]`,
    ])
    .join(', ')})`;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForVitest(),

  {
    files: ['src/**/*.test.mts'],
    rules: defineKnownRules({
      // The rule's autofix rewrites `describe('Ymdhm', …)` to
      // `describe(Ymdhm, …)`, which assumes the identifier is callable. The
      // names these tests use are ts-fortress `Type` objects, so the rewrite
      // does not type-check.
      'vitest/prefer-describe-function-title': 'off',
    }),
  },

  {
    // `setMonth(m)` keeps the day of the month, so 31 January set to February
    // rolls into March, and `setFullYear(y)` / `setFullYear(y, m)` do the same
    // to 29 February or the 31st (#3075). Set the year, month and day in one
    // call, clamping the day, as `withLocaleYearMonth` in `date-utils.mts` does.
    // The selectors check the call's shape only — that the day is passed, not
    // that it is clamped — and see through `d.setMonth!(…)`, `(d.setMonth as F)(…)`
    // and `d['setMonth'](…)`; `Date.prototype.setMonth.call` is not matched.
    files: ['src/**'],
    rules: defineKnownRules({
      'ts-restrictions/no-restricted-syntax': [
        'error',
        {
          selector: restrictedDateSetterCall('Month', 2),
          message:
            'Pass the day too, clamped to the target month, or the day rolls into the next month; `DateUtils.setLocaleMonth` and `addLocaleMonths` do.',
        },
        {
          selector: restrictedDateSetterCall('FullYear', 3),
          message:
            'Pass the month and day too, the day clamped to the target month, or 29 February rolls into March; `DateUtils.updateLocaleYear` does.',
        },
      ],
    }),
  },

  {
    files: ['src/utils/date-utils.mts'],
    rules: defineKnownRules({
      // `Temporal` is not available on Node 22, which is the floor this
      // repository declares in `engines`. Revisit when that floor moves.
      'unicorn/prefer-temporal': 'off',
    }),
  },

  eslintConfigForNodeJs(['scripts/**', 'configs/**']),
  {
    files: ['scripts/**', 'configs/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  { rules: defineKnownRules(dateUtilsRules) },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
