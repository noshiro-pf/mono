/**
 * Throws `error` again from a task of its own, for a `.catch` after each step
 * of a promise chain that runs subscribers (`fromPromise`): after the step that
 * emits and after the one that completes, so that neither exception replaces
 * the other. A subscriber's exception then surfaces as an uncaught error, as
 * one thrown during an update a timer started does (`debounce`, `timer`),
 * rather than as a rejection or not at all.
 */
export const rethrowOutOfPromise = (error: unknown): void => {
  setTimeout(() => {
    // The subscriber's own exception, passed on unchanged.
    // @sumi-expect-error exceptions/no-throw
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- the subscriber's own exception, passed on unchanged
    throw error;
  }, 0);
};
