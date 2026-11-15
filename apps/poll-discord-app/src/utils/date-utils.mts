/**
 * The handful of date helpers this app uses.
 *
 * Ported from the `DateUtils` of the `@noshiro/ts-utils` it used before the
 * monorepo consolidation; `ts-data-forge` has no successor for it. Only what
 * the app calls is here — the original covered far more.
 *
 * "Locale" here means local time, as opposed to the UTC variants the original
 * also provided.
 */
export * as DateUtils from './date-utils-impl.mjs';
