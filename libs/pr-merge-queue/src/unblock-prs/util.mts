/**
 * The small things every other module here needs: the stop signal and what
 * listens to it. Quoting and logging are shared with the other commands, in
 * `../lib/` (`src/lib/`).
 */

import { setTimeout as sleep } from 'node:timers/promises';
import { Arr } from 'ts-data-forge';
import { log } from '../lib/index.mjs';

/**
 * Aborted by SIGINT / SIGTERM; every sleep listens to it.
 *
 * One per process, and it is never reset: an `AbortController` cannot be
 * un-aborted, and nothing here wants to be. The stop it carries means "this
 * run is over" — the loop in `main.mts` leaves, the process exits, and a second
 * SIGINT does not wait for any of that (`installStopHandlers` arms
 * `process.exit(130)` for it). The signal handlers it serves are
 * process-scoped too, so a controller of the same scope is the honest shape.
 *
 * What that rules out is calling the loop twice in one process: the second call
 * would find the signal already aborted and return immediately. So the loop has
 * one caller, the `unblock-prs` command (`src/cmd/unblock-prs.mts`), which runs
 * it once, and it is not exported from the package.
 * `run-unblock-prs-skill` stops its own loop by the same signal, in a process
 * of its own, and counts on both of the above: never reset, and a second signal
 * that exits at once.
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
): string | undefined => branchTipsFromListing(listing).get(branch);

/**
 * Each branch `git ls-remote` lists, by its name without `refs/heads/`, mapped to
 * its tip. Anything that is not a branch is left out.
 */
export const branchTipsFromListing = (
  listing: string,
): ReadonlyMap<string, string> =>
  new Map(
    Arr.generate(function* () {
      for (const line of listing.split('\n')) {
        const [sha, ref] = line.trim().split(/\s+/u, 2);

        if (sha !== undefined && ref?.startsWith('refs/heads/') === true) {
          yield [ref.slice('refs/heads/'.length), sha] as const;
        }
      }
    }),
  );

export const lastLines = (text: string, count: number): string =>
  text.trim().split('\n').slice(-count).join('\n');

/**
 * Sleeps, returning early when a stop has been requested, or when `signal`
 * aborts.
 */
export const pause = async (
  ms: number,
  signal?: Readonly<AbortSignal>,
): Promise<void> => {
  if (stopRequested()) {
    return;
  }

  await sleep(ms, undefined, {
    signal:
      signal === undefined
        ? stopController.signal
        : AbortSignal.any([stopController.signal, signal]),
  }).catch(() => undefined);
};

export const installStopHandlers = (): void => {
  process.once('SIGINT', onSignal);

  process.once('SIGTERM', onSignal);
};

const onSignal = (signal: NodeJS.Signals): void => {
  log(`${signal}: finishing the current step, then stopping.`);

  stopController.abort();

  // A second signal is not a request to be tidy.
  process.once(signal, () => {
    process.exit(130);
  });
};
