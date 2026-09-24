/**
 * The small things every other module here needs: quoting, logging, and the
 * stop signal.
 */

import { setTimeout as sleep } from 'node:timers/promises';

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
 * A ref name this script is willing to put on a command line. Everything is
 * single-quoted anyway; this is a second guard, and it also keeps a name
 * starting with `-` from being read as an option.
 */
export const isSafeRefName = (name: string): boolean =>
  /^[\w./+-]+$/u.test(name) && !name.startsWith('-');

/** Single-quotes a string for a POSIX shell. */
export const sh = (value: string): string =>
  `'${value.replaceAll("'", String.raw`'\''`)}'` as const;

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

export const log = (message: string): void => {
  console.info(
    `[${Temporal.Now.instant().round({ smallestUnit: 'millisecond' }).toString()}] ${message}`,
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
