/**
 * Throws `error` from a task of its own. For what a subscriber throws while a
 * promise callback delivers a value: rethrown inside the callback it would
 * become an unhandled rejection, or, caught by the next `.catch`, be taken for
 * the promise's own rejection.
 */
export const rethrowOutOfPromise = (error: unknown): void => {
  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error -- the subscriber's own exception, passed on unchanged
    throw error;
  }, 0);
};
