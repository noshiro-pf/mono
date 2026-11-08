/**
 * The `DateUtils` functions (of `ts-fortress-types`, and poll-discord-app's own)
 * that read the clock, for `ts-restrictions/no-clock-read-at-module-load`. A
 * package that names further helpers of its own spreads this into its list.
 */
export const dateUtilsClockFunctions = [
  'DateUtils.today',
  'DateUtils.now',
] as const;

/**
 * For every package that imports a `DateUtils`, in every file it lints, as
 * `{ rules: defineKnownRules(dateUtilsRules) }` so that the rule names and their
 * options are type-checked there.
 *
 * - `DateUtils.from` is `new Date(value)`, so a date-only string given to it is
 *   midnight UTC, the day before in local time west of UTC, just as
 *   `ts-restrictions/no-date-only-string-to-date` reports for `new Date` itself
 *   (#3076).
 * - `DateUtils.today()` and `DateUtils.now()` read the clock, which at module
 *   load keeps that moment for as long as a page or an instance lives (#3417).
 */
export const dateUtilsRules = {
  'ts-restrictions/no-date-only-string-to-date': [
    'error',
    { functions: ['DateUtils.from'] },
  ],
  'ts-restrictions/no-clock-read-at-module-load': [
    'error',
    { functions: dateUtilsClockFunctions },
  ],
} as const;
