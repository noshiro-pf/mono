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

/**
 * The workspace packages this app depends on, which nothing the daily
 * production e2e job loads may import at run time.
 */
// Every field of dependencies, so that one declared later is read too.
const workspacePackages = Object.entries(packageJson)
  .filter(([field]) => /dependencies$/iu.test(field))
  .flatMap(([, ranges]) => Object.entries(ranges))
  .filter(
    ([, range]) => typeof range === 'string' && range.startsWith('workspace:'),
  )
  .map(([name]) => name);

// Not `RegExp.escape`: `check:test` loads this config through
// `test/eslint-config.test.mts`, and runs on Node.js versions older than 24.
const escapeRegExp = (text: string): string =>
  text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

/**
 * The rules for a file the daily production e2e job loads.
 *
 * `.github/workflows/e2e-production.yml` installs this app alone and builds
 * nothing, and Playwright imports its config and every spec before it filters
 * by tag, so one of them that imports a workspace package at run time, or a
 * module that does, fails the job with "Cannot find module". Types are erased
 * and may still be imported. The `ts-data-forge` rules ask for imports these
 * files cannot make.
 *
 * @param relativeImports What the file may not reach by a relative path.
 */
// `no-restricted-imports` reads `import` and `export … from` declarations. A
// dynamic `import()` or a `createRequire` is not seen by it, and nothing here
// refuses one: a known limit of this guard.
const productionE2eRules = (
  relativeImports: Readonly<{ regex: string; message: string }>,
): FlatConfig['rules'] =>
  defineKnownRules({
    ...Object.fromEntries(
      Object.keys(eslintPluginTsDataForge.configs.recommended.rules).map(
        (rule) => [rule, 'off'] as const,
      ),
    ),
    'no-restricted-imports': [
      'error',
      mergeRestrictedImportsOptions(restrictedImportsOptions, {
        patterns: [
          {
            // The name alone or a subpath of it (`ts-data-forge/array`), which
            // resolves into the same `dist/` nothing built. A pattern rather than
            // `paths`, which matches the whole specifier only.
            regex: `^(?:${workspacePackages.map(escapeRegExp).join('|')})(?:/|$)`,
            allowTypeImports: true,
            message:
              'The daily production e2e job builds no workspace package; write the helper out in this file.',
          },
          { ...relativeImports, allowTypeImports: true },
        ],
      }),
    ],
  });

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
  // The files of this app the daily production e2e job loads; see
  // `productionE2eRules`. After every other block that sets
  // `no-restricted-imports`, since a later one would replace these options,
  // and after the shared config's, which turns the rule off for `*.config.*`.
  // `test/eslint-config.test.mts` holds all three.
  {
    files: ['e2e/**'],
    rules: productionE2eRules({
      // Any `..` segment, so that `./../src/` is one too. `e2e/` is flat, so
      // every `..` leaves it. In a subdirectory, should one be added, this
      // refuses a `../` that stays inside too: such a layout needs this
      // pattern changed, as the message says, not disabled.
      regex: String.raw`(?:^|/)\.\.(?:/|$)`,
      message:
        'The daily production e2e job builds no workspace package, and a module outside `e2e/` may import one; keep run-time imports within `e2e/`, with no `..` in the path. `e2e/` is flat; a subdirectory needs the pattern of the `e2e/**` block in eslint.config.mts changed.',
    }),
  },
  {
    // This file alone: `test/eslint-config.test.mts` fails when this `files`
    // reaches another module of `configs/`. With no relative import, the specs
    // are all of this app the job's import declarations reach.
    files: ['configs/playwright.production.config.mts'],
    rules: productionE2eRules({
      regex: String.raw`^\.{1,2}(?:/|$)`,
      message:
        'The daily production e2e job builds no workspace package, and a module of this app may import one; import no module of this app here.',
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
