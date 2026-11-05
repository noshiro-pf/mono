import {
  defineKnownRules,
  eslintConfigForNodeJs,
  eslintConfigForTypeScript,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { dateUtilsRules } from '../../tools/configs/eslint-date-utils.mjs';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

export default [
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  eslintConfigForNodeJs(['src/**', 'scripts/**']),

  {
    files: ['src/fetch-event-list-of-user.mts'],
    rules: defineKnownRules({
      // `Temporal` is not available on Node 22, the runtime these functions
      // are deployed to (`scripts/build.mts`). Revisit when that moves.
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    // An event's times are wall-clock times in the zone it was made in
    // (`timezoneOffsetMinutes`), and `firestore.rules` reads them there (#3097).
    // The same two rules are in `apps/event-schedule-app/eslint.config.mts`.
    files: ['src/**'],
    // A test stubs `TZ` to show the code does not depend on it.
    ignores: ['src/**/*.test.mts'],
    rules: defineKnownRules({
      'ts-restrictions/no-restricted-syntax': [
        'error',
        {
          selector:
            ":matches(Literal[value='Asia/Tokyo'], TemplateElement[value.cooked='Asia/Tokyo'])",
          message:
            "Read an event's times in its own zone, with `answerDeadlineMillis` or `wallClockInOffset` from event-schedule-app-shared, not in Japan's.",
        },
        {
          selector:
            "CallExpression:matches([callee.name=/^(compareYmdhm|ymdhmDateDiff)$/], [callee.property.name=/^(compareYmdhm|ymdhmDateDiff)$/]) Identifier[name='answerDeadline']",
          message:
            "Compare the deadline as an instant, with `isAfterAnswerDeadline` or `answerDeadlineMillis` from event-schedule-app-shared: a Ymdhm `now()` is the clock of the zone this runs in, not the event's.",
        },
      ],
    }),
  },

  {
    files: ['src/**/*.test.mts'],
    rules: defineKnownRules({
      // The tests name instants as ISO strings in UTC, which `Date.parse`
      // reads the same everywhere; `Temporal` is not on Node 22 (above).
      'unicorn/prefer-temporal': 'off',
    }),
  },

  {
    files: ['scripts/**'],
    rules: defineKnownRules({
      '@typescript-eslint/explicit-function-return-type': 'off',
      'import-x/no-default-export': 'off',
    }),
  },

  { rules: defineKnownRules(dateUtilsRules) },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
