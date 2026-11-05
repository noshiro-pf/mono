/**
 * Runs `body` and returns what it returns; if it throws, runs `undo` and lets
 * the exception go on. `switchMap` and `mergeMap` use it to dispose what a
 * projection made when the projection, or the subscription to what it returned,
 * throws, so that it does not outlive the failure.
 *
 * A flag and `finally` rather than `catch` and rethrow: Sumi bans `try..catch`,
 * and the exception is never caught on its way out.
 */
export const runUndoingOnThrow = <T,>(body: () => T, undo: () => void): T => {
  let mut_succeeded = false;

  // @sumi-expect-error exceptions/no-try
  try {
    const result = body();

    mut_succeeded = true;

    return result;
  } finally {
    if (!mut_succeeded) {
      undo();
    }
  }
};
