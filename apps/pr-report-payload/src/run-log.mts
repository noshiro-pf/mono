/**
 * What `unblock-prs` did, kept where the page can read it.
 *
 * The script runs on someone's machine and says everything it does on
 * standard output, which is exactly where nobody can see it afterwards — the
 * one place a passed-over pull request or a rebase that conflicted was ever
 * reported. So each run that acts on something appends a record to an issue
 * of its own, the same way the report writes one.
 *
 * Events rather than lines. The script's output is prose meant to be watched
 * live; what is worth keeping is the shape underneath it — which pull request,
 * what was done to it, and how that turned out — which is also what a page can
 * lay out as rows instead of a wall of text.
 */

import * as t from 'ts-fortress';

export const RUN_LOG_VERSION = 1;

/**
 * How many runs the issue keeps, newest first. An issue body holds 65536
 * characters and this is the only thing that grows without bound, so the tail
 * is dropped rather than left to truncate the block one day in the middle of
 * its JSON.
 */
export const RUN_LOG_MAX_RUNS = 20;

/** The same, per run. A single run can act many times before it is stopped. */
export const RUN_LOG_MAX_EVENTS = 50;

/**
 * What became of one attempt.
 *
 * `released` is this repository's actual action: `unblock-prs` rebases and
 * then takes `skip-ci` off, which is what lets the checks run on the head
 * that will be merged. `set-aside` is the one worth keeping — a rebase that
 * conflicted or a push that was refused is a thing that happened once, on
 * somebody's terminal, and was never visible again.
 */
export type RunLogOutcome =
  'failed' | 'merged' | 'released' | 'set-aside' | 'unfinished';

export type RunLogEvent = Readonly<{
  at: string;
  atEpochMs: number;
  /** The pull request it happened to. */
  number: number;
  outcome: RunLogOutcome;
  /** One sentence: what was done, or why it was not. */
  detail: string;
}>;

export type RunLogEntry = Readonly<{
  startedAt: string;
  startedAtEpochMs: number;
  finishedAt: string;
  finishedAtEpochMs: number;
  /** Whether the run was only saying what it would have done. */
  dryRun: boolean;
  /** Oldest first, as they happened. */
  events: readonly RunLogEvent[];
}>;

export type UnblockPrsLog = Readonly<{
  version: number;
  /** Newest first, so the page shows the last run without reversing it. */
  runs: readonly RunLogEntry[];
}>;

export const RunLogEventSchema: t.Type<RunLogEvent> = t.record({
  at: t.string(),
  atEpochMs: t.number(),
  number: t.number(),
  outcome: t.enumType([
    'failed',
    'merged',
    'released',
    'set-aside',
    'unfinished',
  ]),
  detail: t.string(),
});

export const RunLogEntrySchema: t.Type<RunLogEntry> = t.record({
  startedAt: t.string(),
  startedAtEpochMs: t.number(),
  finishedAt: t.string(),
  finishedAtEpochMs: t.number(),
  dryRun: t.boolean(),
  events: t.array(RunLogEventSchema),
});

export const UnblockPrsLogSchema: t.Type<UnblockPrsLog> = t.record({
  version: t.number(),
  runs: t.array(RunLogEntrySchema),
});
