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
 * How many runs the log keeps, newest first. This is the only payload that
 * grows without an upper bound of its own, and the file is rewritten whole
 * each time, so the tail is dropped rather than left to grow a branch that is
 * force-pushed on every run of the script.
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
 *
 * Its own schema rather than an `enumType` inline in the event below, because
 * `recordEvent` takes one of these as an argument and so the type is wanted
 * on its own. Derived from the schema, so the members are listed once.
 */
export const RunLogOutcomeSchema = t.enumType([
  'failed',
  'merged',
  'released',
  'set-aside',
  'unfinished',
]);

export type RunLogOutcome = t.TypeOf<typeof RunLogOutcomeSchema>;

export const RunLogEventSchema = t.record({
  at: t.string(),
  atEpochMs: t.number(),
  /** The pull request it happened to. */
  number: t.number(),
  outcome: RunLogOutcomeSchema,
  /** One sentence: what was done, or why it was not. */
  detail: t.string(),
});

export type RunLogEvent = t.TypeOf<typeof RunLogEventSchema>;

export const RunLogEntrySchema = t.record({
  startedAt: t.string(),
  startedAtEpochMs: t.number(),
  finishedAt: t.string(),
  finishedAtEpochMs: t.number(),
  /** Whether the run was only saying what it would have done. */
  dryRun: t.boolean(),
  /** Oldest first, as they happened. */
  events: t.array(RunLogEventSchema),
});

export type RunLogEntry = t.TypeOf<typeof RunLogEntrySchema>;

export const UnblockPrsLogSchema = t.record({
  version: t.number(),
  /** Newest first, so the page shows the last run without reversing it. */
  runs: t.array(RunLogEntrySchema),
});

export type UnblockPrsLog = t.TypeOf<typeof UnblockPrsLogSchema>;
