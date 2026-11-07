import { hasKey, isRecord, isString, Result } from 'ts-data-forge';

/**
 * `promise`, with a rejection turned into an `Err` of what it rejected with, so
 * that a step that throws is reported as one that returns an error is.
 */
export const settleAuthStep = async <T, E>(
  promise: Promise<Result<T, E>>,
): Promise<Result<T, unknown>> => {
  const result = await Result.fromPromise(promise);

  return Result.isOk(result) ? result.value : result;
};

/**
 * Runs a submit's `steps` tied to the dialog session it starts in, then ends
 * its wait with `endWait`, whether they succeeded, failed or threw; once the
 * dialog was closed meanwhile, closing has already reset the wait, which now
 * belongs to the dialog on screen, so it is left alone.
 */
export const runSubmitSteps = async (
  trackSession: () => () => boolean,
  steps: (isStillCurrent: () => boolean) => Promise<void>,
  endWait: () => void,
): Promise<void> => {
  const isCurrent = trackSession();

  try {
    await steps(isCurrent);
  } finally {
    if (isCurrent()) {
      endWait();
    }
  }
};

/** The code of an `AuthError`, or `undefined` for what a step rejected with. */
export const authErrorCodeOf = (error: unknown): string | undefined =>
  isRecord(error) && hasKey(error, 'code') && isString(error.code)
    ? error.code
    : undefined;

/**
 * What to log for a step's error: its code and message, as for every
 * `AuthError`, or what it rejected with.
 */
export const describeAuthError = (error: unknown): readonly unknown[] =>
  isRecord(error) && hasKey(error, 'code')
    ? ([
        error.code,
        hasKey(error, 'message') ? error.message : undefined,
      ] as const)
    : ([error] as const);
