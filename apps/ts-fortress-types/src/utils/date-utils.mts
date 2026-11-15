/**
 * The date accessors this package needs.
 *
 * Ported from the `DateUtils` of the `@noshiro/ts-utils` it used before the
 * monorepo consolidation; `ts-data-forge` has no successor for it. The original
 * also defined a `DateType` that hid `Date`'s own getters so that these had to
 * be used; that is not reproduced here — the parameter is a plain `Date`.
 *
 * `Date`'s getters are typed `number`, so each result is narrowed before it is
 * returned. A real `Date` always satisfies these ranges; the fallbacks exist
 * because the type system cannot know that.
 *
 * "Locale" means local time, as opposed to the UTC variants the original also
 * provided.
 */
export * as DateUtils from './date-utils-impl.mjs';
