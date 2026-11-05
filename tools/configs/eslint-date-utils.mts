/**
 * For every package that imports `DateUtils` from `ts-fortress-types`, in every
 * file it lints, as `{ rules: defineKnownRules(dateUtilsRules) }` so that the
 * rule name and its options are type-checked there. `DateUtils.from` is
 * `new Date(value)`, so a date-only string given to it is midnight UTC, the day
 * before in local time west of UTC, just as
 * `ts-restrictions/no-date-only-string-to-date` reports for `new Date` itself
 * (#3076).
 */
export const dateUtilsRules = {
  'ts-restrictions/no-date-only-string-to-date': [
    'error',
    { functions: ['DateUtils.from'] },
  ],
} as const;
