/**
 * The unattended loop `run-unblock-prs-skill` and `run-issue-resolver` share
 * (`spec/commands.md`, "The unattended loop", **new in v2**, #3089): the
 * interval pause, logging only what changed, stopping, fatal errors, and what a
 * session that ran comes to.
 */

import * as fs from 'node:fs/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import type { RanOutcome, ResultEvent } from './claude.mjs';

/**
 * Runs `round` until stopped, or once under `once`. A round that ran a session
 * is followed by the next at once; one that found nothing waits `intervalMs`.
 * What a round that waits is waiting on (`notes`) is logged only when it
 * changes, since the log is read afterwards for what the sessions did. A
 * `fatal` error ends the loop, as any error does under `once`; another is
 * logged and the loop goes on, as does a round that throws.
 */
export const runRounds = async (
  options: Readonly<{ once: boolean; intervalMs: number }>,
  round: () => Promise<RoundResult>,
  world: LoopWorld,
): Promise<Result<undefined, string>> => {
  let mut_lastNotes = '';

  while (!world.stopRequested()) {
    // eslint-disable-next-line no-await-in-loop -- one round after another
    const done: RoundResult = await round().catch((error: unknown) =>
      Result.err({ fatal: false, message: unknownToString(error) } as const),
    );

    // What was said before a session is said again after it.
    if (Result.isOk(done) && done.value.ran) {
      mut_lastNotes = '';
    }

    const waiting =
      Result.isOk(done) && !done.value.ran ? done.value.notes : undefined;

    const changed = waiting !== undefined && waiting !== mut_lastNotes;

    if (changed) {
      mut_lastNotes = waiting;

      if (waiting !== '') {
        world.log(waiting);
      }
    }

    if (Result.isErr(done)) {
      if (options.once || done.value.fatal) {
        return Result.err(done.value.message);
      }

      world.log(done.value.message);
    }

    if (options.once || world.stopRequested()) {
      break;
    }

    if (Result.isOk(done) && done.value.ran) {
      continue;
    }

    if (changed || Result.isErr(done)) {
      world.log(`Checking again every ${options.intervalMs / 60_000} min.`);
    }

    // eslint-disable-next-line no-await-in-loop -- the pause between rounds
    await world.sleep(options.intervalMs);
  }

  return Result.ok(undefined);
};

/**
 * What a session that ran is said to have come to: how it ended, what it spent,
 * and how to reopen it.
 */
export const describeOutcome = (outcome: RanOutcome): string => {
  const { result, sessionId, exitCode } = outcome;

  const how =
    result === undefined
      ? (`exited ${exitCode ?? 'on a signal'} without a result` as const)
      : (`ended ${result.subtype ?? 'with no subtype'}` as const);

  const spent = [
    result?.turns === undefined ? undefined : `${result.turns} turns`,
    result?.costUsd === undefined ? undefined : `$${result.costUsd.toFixed(2)}`,
  ].filter((part) => part !== undefined);

  return [
    `The session ${how}`,
    Arr.isNonEmpty(spent) ? ` (${spent.join(', ')})` : '',
    '.',
    sessionId === undefined
      ? ''
      : ` \`claude --resume ${sessionId}\` reopens it.`,
  ].join('');
};

/**
 * Whether a session may have cost anything: all but one whose result says it
 * failed and spent nothing. A cost it did not report may not be nothing.
 */
export const mayHaveSpent = (result: ResultEvent | undefined): boolean =>
  !(result?.isError === true && result.costUsd === 0);

/** Drops from `mut_items`, a set or a map, the keys `keep` does not keep. */
export const forgetAllBut = <A,>(
  mut_items: Readonly<{
    keys: () => IterableIterator<A>;
    delete: (key: A) => boolean;
  }>,
  keep: (key: A) => boolean,
): void => {
  for (const key of Array.from(mut_items.keys())) {
    if (!keep(key)) {
      mut_items.delete(key);
    }
  }
};

/** Removes `dir`, or says why it could not: worth a line, not the round. */
export const removeDir = async (
  dir: string,
  log: (line: string) => void,
): Promise<void> => {
  await fs.rm(dir, { recursive: true, force: true }).catch((error: unknown) => {
    log(`cannot remove ${dir}: ${unknownToString(error)}`);
  });
};

/**
 * `ran` when a session ran, so that the next round starts at once; `notes`,
 * what the round found it has to wait on.
 */
export type RoundResult = Result<
  Readonly<{ ran: boolean; notes: string }>,
  RoundError
>;

/** `fatal` when every later round would meet it too. */
export type RoundError = Readonly<{ fatal: boolean; message: string }>;

export type LoopWorld = Readonly<{
  log: (line: string) => void;
  /** Whether a stop was asked for: the round running finishes first. */
  stopRequested: () => boolean;
  /** Waits `ms`, or less when a stop is asked for. */
  sleep: (ms: number) => Promise<void>;
}>;
