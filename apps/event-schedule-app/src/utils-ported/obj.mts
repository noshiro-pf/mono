/**
 * The `Obj` this app was written against.
 *
 * `ts-data-forge`'s `Obj` does not have the immutable updates — `set`,
 * `update`, `setIn`, `updateIn` — that 54 call sites here use, so those are
 * ported from the `@noshiro/ts-utils` of before the monorepo consolidation.
 * Everything else this app asks of `Obj` is re-exported unchanged; anything
 * `ts-data-forge` grows later has to be named here to reach those call sites.
 */
export * as Obj from './obj-impl.mjs';
