/**
 * The small things every other module here needs: the stop signal and what
 * listens to it. Quoting and logging are shared with the other commands, in
 * `tools/scripts/lib/`.
 */

import { setTimeout as sleep } from 'node:timers/promises';
import { log } from '../../lib/log.mjs';

/**
 * Aborted by SIGINT / SIGTERM; every sleep listens to it.
 *
 * One per process, and it is never reset: an `AbortController` cannot be
 * un-aborted, and nothing here wants to be. The stop it carries means "this
 * run is over" — the loop in `main.mts` leaves, the process exits, and a
 * second SIGINT does not wait for any of that (`installStopHandlers` arms
 * `process.exit(130)` for it). The signal handlers it serves are
 * process-scoped too, so a controller of the same scope is the honest shape.
 *
 * What that rules out is calling the loop twice in one process: the second
 * call would find the signal already aborted and return immediately. So the
 * loop is not exported — `main.mts` runs it once, behind
 * `isDirectlyExecuted`, and there is no second caller to get this wrong.
 */
const stopController = new AbortController();

/**
 * Read through a call rather than directly, because the flag flips inside a
 * signal handler and TypeScript would otherwise narrow it to `false` for the
 * rest of any block that has already tested it.
 */
export const stopRequested = (): boolean => stopController.signal.aborted;

/**
 * The SHA `git ls-remote` lists for `branch`, by its whole ref name. A ref
 * pattern given to `ls-remote` matches on the tail of the name, so
 * `ls-remote origin main` lists `refs/heads/changeset-release/main` too, and
 * first; the first line is not the branch asked for.
 */
export const headShaFromListing = (
  listing: string,
  branch: string,
): string | undefined =>
  listing
    .split('\n')
    .map((line) => line.trim().split(/\s+/u))
    .find(([, ref]) => ref === `refs/heads/${branch}`)?.[0];

export const lastLines = (text: string, count: number): string =>
  text.trim().split('\n').slice(-count).join('\n');

/** Sleeps, returning early when a stop has been requested. */
export const pause = async (ms: number): Promise<void> => {
  if (stopRequested()) {
    return;
  }

  await sleep(ms, undefined, { signal: stopController.signal }).catch(
    () => undefined,
  );
};

export const installStopHandlers = (): void => {
  const onSignal = (signal: NodeJS.Signals): void => {
    log(`${signal}: finishing the current step, then stopping.`);

    stopController.abort();

    // A second signal is not a request to be tidy.
    process.once(signal, () => {
      process.exit(130);
    });
  };

  process.once('SIGINT', onSignal);

  process.once('SIGTERM', onSignal);
};
