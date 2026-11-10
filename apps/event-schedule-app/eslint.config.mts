import {
  defineKnownRules,
  eslintConfigForPlaywright,
  eslintConfigForSynstateDom,
  eslintConfigForTypeScript,
  mergeRestrictedImportsOptions,
  restrictedImportsOptions,
  type FlatConfig,
} from 'eslint-config-typed';
import { eslintPluginTsDataForge } from 'eslint-plugin-ts-data-forge';
import { eslintPluginTsFortress } from 'eslint-plugin-ts-fortress';
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';
import {
  dateUtilsClockFunctions,
  dateUtilsRules,
} from '../../tools/configs/eslint-date-utils.mjs';
import { eslintConfigOffForOxlint } from '../../tools/configs/oxlint-rules.mjs';
import packageJson from './package.json' with { type: 'json' };

const thisDir = import.meta.dirname;

/** The workspace packages this app depends on, which `e2e/` may not import. */
const workspacePackages = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
})
  .filter(([, range]) => range.startsWith('workspace:'))
  .map(([name]) => name);

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

  // Accessibility, reading synstate-dom's `constant(x)` as `x`.
  eslintConfigForSynstateDom(['src/**/*.tsx']),

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
    // The same two time rules are in `apps/event-schedule-app-functions/eslint.config.mts`;
    // the first rule below, on auth error codes, is this app's alone. The
    // rules share one block, and so its ignores, since a later block setting
    // the same rule would replace these options rather than add to them.
    files: ['src/**'],
    ignores: [
      // A test stubs `TZ` to show the code does not depend on it.
      'src/**/*.test.mts',
      // Compares the deadline being edited with the editor's clock, which is
      // the event's zone: saving stores the editor's offset with the event.
      'src/components/organisms/notification-settings.tsx',
      // The one place the password-failure codes below are matched.
      'src/functions/credential-error.mts',
    ],
    rules: defineKnownRules({
      'ts-restrictions/no-restricted-syntax': [
        'error',
        {
          // Under email enumeration protection a wrong password is
          // `auth/invalid-credential`, so a form matching one code misses the
          // other (#2955).
          selector:
            ':matches(Literal[value=/^auth\\/(wrong-password|invalid-credential)$/u], TemplateElement[value.cooked=/^auth\\/(wrong-password|invalid-credential)$/u])',
          message:
            'Read a failed password sign-in with `credentialErrorOf` from src/functions/credential-error.mts, which knows every code Firebase reports it as.',
        },
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
  {
    // `.github/workflows/e2e-production.yml` installs this app alone and
    // builds nothing, and Playwright imports every spec before it filters by
    // tag, so a spec that imports a workspace package at run time, or a module
    // of `src/` that does, fails the daily job with "Cannot find module".
    // Types are erased and may still be imported. The `ts-data-forge` rules
    // ask for imports these files cannot make.
    files: ['e2e/**'],
    rules: defineKnownRules({
      ...Object.fromEntries(
        Object.keys(eslintPluginTsDataForge.configs.recommended.rules).map(
          (rule) => [rule, 'off'] as const,
        ),
      ),
      'no-restricted-imports': [
        'error',
        mergeRestrictedImportsOptions(restrictedImportsOptions, {
          paths: workspacePackages.map((name) => ({
            name,
            allowTypeImports: true,
            message:
              'The daily production e2e job builds no workspace package; write the helper out in the spec.',
          })),
          patterns: [
            {
              regex: String.raw`^\.\./`,
              allowTypeImports: true,
              message:
                'The daily production e2e job builds no workspace package, and a module outside `e2e/` may import one; keep run-time imports within `e2e/`.',
            },
          ],
        }),
      ],
    }),
  },

  { rules: defineKnownRules(dateUtilsRules) },
  {
    // This app's own clock reads (`src/utils/today.mts`), as well as DateUtils'.
    files: ['src/**'],
    rules: defineKnownRules({
      'ts-restrictions/no-clock-read-at-module-load': [
        'error',
        {
          functions: [...dateUtilsClockFunctions, 'todayYearMonthDate', 'now'],
        },
      ],
    }),
  },

  // Last, so that nothing above turns these back on.
  eslintConfigOffForOxlint,
] satisfies readonly FlatConfig[];
