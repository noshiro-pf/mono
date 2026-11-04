import { Result } from 'ts-data-forge';

/**
 * Runs the body of a Discord event listener and logs both ways it can fail: a
 * returned `Result.err`, and a throw or rejection (`reaction.fetch()` on a
 * deleted message, a Discord API call refused for a missing permission).
 *
 * The listeners discord.js calls return `void`, so nothing awaits the body. A
 * rejection nothing handles here is an unhandled rejection, which ends the
 * whole bot process on Node.js.
 *
 * @param eventName The discord.js event, used to label the log line.
 * @param body The listener's work.
 * @param logError Where the failures are written.
 */
export const runListener = (
  eventName: string,
  body: () => Promise<Result<unknown, unknown>>,
  logError: (message: string, error: unknown) => void = console.error,
): void => {
  // An async function calls `body` before `runListener` returns, so the body
  // reads the discord.js objects during the emit that handed them over, and a
  // synchronous throw becomes a rejection.
  const run = async (): Promise<void> => {
    const result = await body();

    if (Result.isErr(result)) {
      logError(`on ${eventName} error:`, result);
    }
  };

  run().catch((error: unknown) => {
    logError(`on ${eventName} threw:`, error);
  });
};
