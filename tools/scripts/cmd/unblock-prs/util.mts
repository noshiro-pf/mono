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

/** Single-quotes a string for a POSIX shell. */
export const sh = (value: string): string =>
  `'${value.replaceAll("'", String.raw`'\''`)}'` as const;

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

export const log = (message: string): void => {
  console.info(logLine(message));
};

/**
 * `message` stamped with the time in the machine's time zone (`TZ`), because
 * the person reading the log reads it against their own clock. The offset
 * stays in the stamp, so a line pasted elsewhere still names one instant.
 */
export const logLine = (
  message: string,
  now: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO(),
): string =>
  `[${now.toString({ smallestUnit: 'millisecond', timeZoneName: 'never' })}] ${message}` as const;

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
