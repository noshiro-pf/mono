import {
  defineKnownRules,
  eslintConfigForPlaywright,
  eslintConfigForTypeScript,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';

const thisDir = import.meta.dirname;

export default [
  {
    // The bundle `../event-schedule-app-functions` builds for Cloud Functions.
    ignores: ['functions-build/**'],
  },
  ...eslintConfigForTypeScript({
    tsconfigRootDir: thisDir,
    tsconfigFileName: './tsconfig.json',
    packageDirs: [thisDir],
  }),

  eslintPluginTsTypeForge.configs.recommended,
  eslintPluginTsDataForge.configs.recommended,
  eslintPluginTsFortress.configs.recommended,

  {
    files: ['src/**'],
    rules: defineKnownRules({
      // `Temporal` is not available on Node 22, which is the floor this
      // repository declares in `engines`, and this app's calendar arithmetic
      // is the same `Date` arithmetic `apps/ts-fortress-types` turns the rule
      // off for. Revisit when that floor moves.
      'unicorn/prefer-temporal': 'off',
    }),
  },
  {
    // Firebase is reached only through `src/api/`, which builds the `Api` the
    // stores are handed — so a store's test can hand it a fake instead (#2094).
    // Types may still be imported anywhere.
    files: ['src/**'],
    ignores: ['src/api/**'],
    rules: defineKnownRules({
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          patterns: [
            {
              group: ['firebase/*', '@firebase/*'],
              allowTypeImports: true,
              message:
                'Reach Firebase through the `Api` from src/api/, so that a test can hand a fake one in.',
            },
          ],
        }),
      ],
    }),
  },
  {
    // An event's times are wall-clock times in the zone it was made in
    // (`timezoneOffsetMinutes`), and `firestore.rules` reads them there (#3097).
    // The same two rules are in `apps/event-schedule-app-functions/eslint.config.mts`.
    files: ['src/**'],
    ignores: [
      // A test stubs `TZ` to show the code does not depend on it.
      'src/**/*.test.mts',
      // Compares the deadline being edited with the editor's clock, which is
      // the event's zone: saving stores the editor's offset with the event.
      'src/components/organisms/notification-settings.tsx',
    ],
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
  eslintConfigForPlaywright(['e2e/**']),

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
