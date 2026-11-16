import * as Arr from 'ts-data-forge/array';

/**
 * The teardowns a custom observable registers with its `onComplete` tool
 * (`createRootObservable`, `createSyncChildObservable`,
 * `createAsyncChildObservable`), run from its `teardown`.
 */
export type TeardownList = Readonly<{
  add: (teardown: () => void) => void;

  /**
   * Runs every teardown added and not yet run, each taken off the list before
   * it runs: one that throws stops the rest, which a later call runs, and those
   * that ran are not run again. One added while they run is run too.
   */
  runAll: () => void;
}>;

export const createTeardownList = (): TeardownList => {
  let mut_pending: readonly (() => void)[] = [];

  return {
    add: (teardown) => {
      mut_pending = Arr.toPushed(mut_pending, teardown);
    },
    runAll: () => {
      while (Arr.isNonEmpty(mut_pending)) {
        const [next, ...rest] = mut_pending;

        mut_pending = rest;

        next();
      }
    },
  };
};
