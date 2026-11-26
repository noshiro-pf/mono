/* eslint-disable no-restricted-syntax -- a module the tests import, not a test of its own */
/* oxlint-disable import/no-mutable-exports -- `count` is a binding another module writes, which the tests are about */
// A module `prefer-range-for-loop.test.mts` imports a loop end from: one this
// file cannot see written, and one no one can write.
import type { SafeInt } from 'ts-type-forge';

/** Written by the module that exports it, as `bump` does. */
// eslint-disable-next-line functional/no-let -- what the test is about: a binding another module writes
export declare let count: SafeInt;

export declare const fixedCount: SafeInt;

export declare const bump: () => void;
