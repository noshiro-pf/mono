// cspell:ignore ededed

/**
 * What this run did, and where that is kept.
 *
 * Everything this script does it says on standard output, which is exactly
 * where nobody can see it afterwards. A rebase that conflicted, a push that
 * was refused, a queued pull request passed over for having no auto-merge —
 * each happened once, on somebody's terminal, and was never visible again.
 * So a run that acted on something appends a record to an issue of its own,
 * the way the report writes one, and the Pull Requests Manager page reads it
 * back.
 *
 * Events, not lines. The output is prose meant to be watched live; what is
 * worth keeping is the shape underneath it — which pull request, what was
 * done, how it turned out.
 */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  embedRunLog,
  extractRunLog,
  RUN_LOG_MAX_EVENTS,
  RUN_LOG_MAX_RUNS,
  RUN_LOG_VERSION,
  type RunLogEntry,
  type RunLogEvent,
  type RunLogOutcome,
  type UnblockPrsLog,
} from 'pr-report-payload';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { git, parseJson } from './github.mjs';
import { type WatchOutcome } from './types.mjs';
import { log, sh } from './util.mjs';

/**
 * The label that identifies the one log issue across runs, chosen for the
 * same reason `pr-report` uses one: a title can be edited by anyone reading
 * it, and a script has nowhere to remember a number between runs.
 */
export const RUN_LOG_LABEL = 'unblock-prs-log';

/**
 * What this run has done so far.
 *
 * Module scope, like the stop controller in `util.mts` and for the same
 * reason: there is one run per process, and the loop is not exported, so
 * there is no second caller to get this wrong.
 */
const mut_events: RunLogEvent[] = [];

const startedAt = Temporal.Now.instant();

/** One thing that happened to one pull request. */
export const recordEvent = (
  number: number,
  outcome: RunLogOutcome,
  detail: string,
): void => {
  const at = Temporal.Now.instant();

  mut_events.push({
    at: at.round({ smallestUnit: 'second' }).toString(),
    atEpochMs: at.epochMilliseconds,
    number,
    outcome,
    detail,
  });
};

/**
 * The same, for the end of a watch.
 *
 * Only two of the outcomes are verdicts about the pull request itself; the
 * rest are things that happened to the *watch* — the base moved, the branch
 * was pushed, the run was interrupted — and calling those failures would put
 * a red row in the log for a pull request nothing is wrong with.
 */
export const recordWatchOutcome = (
  number: number,
  outcome: WatchOutcome,
): void => {
  switch (outcome) {
    case 'merged':
      recordEvent(number, 'merged', 'merged');

      break;

    case 'checks-failed':
      recordEvent(number, 'failed', 'a required check failed');

      break;

    case 'stopped':
      recordEvent(number, 'unfinished', 'the run was interrupted');

      break;

    case 'auto-merge-disabled':
    case 'behind-again':
    case 'closed':
    case 'error':
    case 'head-moved':
    case 'not-merging':
    case 'skip-ci-labelled':
    case 'timeout':
      recordEvent(
        number,
        'unfinished',
        `the watch ended: ${outcome.replaceAll('-', ' ')}`,
      );

      break;
  }
};

/**
 * Writes this run into the log issue, or says why it could not.
 *
 * Never fails the run. The script's job is to land pull requests, and a log
 * that could not be written is not a reason to stop doing it — but it is a
 * reason to say so, because a silently missing entry is worse than none.
 */
export const publishRunLog = async (
  dryRun: boolean,
): Promise<Result<'nothing-to-say' | 'published', string>> => {
  if (!Arr.isNonEmpty(mut_events)) return Result.ok('nothing-to-say');

  const finishedAt = Temporal.Now.instant();

  const entry: RunLogEntry = {
    startedAt: startedAt.round({ smallestUnit: 'second' }).toString(),
    startedAtEpochMs: startedAt.epochMilliseconds,
    finishedAt: finishedAt.round({ smallestUnit: 'second' }).toString(),
    finishedAtEpochMs: finishedAt.epochMilliseconds,
    dryRun,
    // The tail, because a long run's later events are the ones still worth
    // reading; the cap is what keeps one run from filling the body.
    events: mut_events.slice(-RUN_LOG_MAX_EVENTS),
  };

  const existing = await readLogIssue();

  if (Result.isErr(existing)) return existing;

  const runs = Arr.toUnshifted(entry)(existing.value?.log.runs ?? []).slice(
    0,
    RUN_LOG_MAX_RUNS,
  );

  const next: UnblockPrsLog = { version: RUN_LOG_VERSION, runs };

  const written = await writeLogIssue(existing.value?.number, render(next));

  return Result.isErr(written) ? written : Result.ok('published');
};

const RUN_LOG_TITLE = 'unblock-prs log';

const IssueListSchema = t.array(
  t.record({ number: t.number(), body: t.union([t.string(), t.nullType]) }),
);

/** The log issue as it is now, or `undefined` when there is not one yet. */
const readLogIssue = async (): Promise<
  Result<Readonly<{ number: number; log: UnblockPrsLog }> | undefined, string>
> => {
  const listed = await git(
    `gh issue list --label ${RUN_LOG_LABEL} --state open --limit 1 --json number,body`,
  );

  if (Result.isErr(listed)) return listed;

  const parsed = parseJson(listed.value, IssueListSchema);

  if (Result.isErr(parsed)) return parsed;

  const issue = parsed.value[0];

  if (issue === undefined) return Result.ok(undefined);

  const log_ = extractRunLog(issue.body ?? '');

  // A body with no block yet — the issue was opened by hand, or by a version
  // of this script that did not embed one — is an empty log rather than an
  // error. The alternative is a script that refuses to log because it has
  // never logged.
  return Result.ok({
    number: issue.number,
    log: Result.isErr(log_)
      ? { version: RUN_LOG_VERSION, runs: [] }
      : log_.value,
  });
};

/**
 * Through a file rather than an argument: a body is Markdown with newlines in
 * it, and the whole log at once is tens of kilobytes.
 */
const writeLogIssue = async (
  number: number | undefined,
  body: string,
): Promise<Result<undefined, string>> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'unblock-prs-log-'));

  const file = path.join(dir, 'body.md');

  const written = await Result.fromPromise(
    // The path is this function's own: `mkdtemp` made the directory a line
    // above and nothing outside chose either half of it.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFile(file, body),
  );

  if (Result.isErr(written)) {
    return Result.err(`could not write the log body: ${String(written.value)}`);
  }

  try {
    if (number === undefined) {
      // The label has to exist before an issue can be opened with it, and
      // `--force` makes this one call whether or not it does.
      const labelled = await git(
        `gh label create ${RUN_LOG_LABEL} --color ededed --description 'What unblock-prs did, updated in place' --force`,
      );

      if (Result.isErr(labelled)) return labelled;

      const created = await git(
        `gh issue create --title ${sh(RUN_LOG_TITLE)} --label ${RUN_LOG_LABEL} --body-file ${sh(file)}`,
      );

      return Result.isErr(created) ? created : Result.ok(undefined);
    }

    const edited = await git(`gh issue edit ${number} --body-file ${sh(file)}`);

    return Result.isErr(edited) ? edited : Result.ok(undefined);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

/**
 * The issue body: the runs as prose, and the same runs as the block the page
 * reads. One body, so the two cannot disagree.
 */
const render = (logged: UnblockPrsLog): string =>
  [
    `# ${RUN_LOG_TITLE}`,
    '',
    `What \`pnpm run unblock-prs\` did, most recent first, ${RUN_LOG_MAX_RUNS} runs at most.`,
    'Written by the script itself; nothing else edits this issue.',
    '',
    ...logged.runs.flatMap((run) => [
      `## ${run.startedAt}${run.dryRun ? ' (dry run)' : ''}`,
      '',
      ...run.events.map(
        (event) => `- \`${event.at}\` #${event.number} — ${event.detail}`,
      ),
      '',
    ]),
    embedRunLog(logged),
    '',
  ].join('\n');

/** Said by `main.mts` once the loop is over. */
export const reportRunLog = (
  result: Result<'nothing-to-say' | 'published', string>,
): void => {
  if (Result.isErr(result)) {
    log(`Could not write the ${RUN_LOG_LABEL} issue: ${result.value}`);
  } else if (result.value === 'published') {
    log(`Wrote this run to the ${RUN_LOG_LABEL} issue.`);
  }
};
