// cspell:ignore gpgsign

/**
 * What this run did, and where that is kept.
 *
 * Everything this script does it says on standard output, which is exactly
 * where nobody can see it afterwards. A rebase that conflicted, a push that
 * was refused, a queued pull request passed over for having no auto-merge —
 * each happened once, on somebody's terminal, and was never visible again.
 * So a run that acted on something adds a record to a file of its own, and
 * the Pull Requests Manager page reads it back.
 *
 * Events, not lines. The output is prose meant to be watched live; what is
 * worth keeping is the shape underneath it — which pull request, what was
 * done, how it turned out.
 *
 * **A branch, not an issue.** `RUN_LOG_BRANCH` holds one JSON file and
 * nothing else, force-pushed as a single orphan commit so that the
 * repository does not accumulate a commit per run. It was an issue until
 * recently, which meant this script's bookkeeping sat in the issue list
 * beside the things issues are for; `apps/pr-report-payload/src/location.mts`
 * has the rest of that reasoning.
 *
 * The push is plain `git` against whatever URL `origin` already resolves to,
 * so it works with the credentials the person running this pushes branches
 * with, SSH or HTTPS. It signs nothing: this is machine output, and a
 * `commit.gpgsign` set globally would otherwise make the log fail on a
 * machine with no key loaded.
 */

import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  parseRunLog,
  RUN_LOG_BRANCH,
  RUN_LOG_MAX_EVENTS,
  RUN_LOG_MAX_RUNS,
  RUN_LOG_PATH,
  RUN_LOG_VERSION,
  serializeRunLog,
  type RunLogEntry,
  type RunLogEvent,
  type RunLogOutcome,
  type UnblockPrsLog,
} from 'pr-report-payload';
import { Arr, Result } from 'ts-data-forge';
import { git } from './github.mjs';
import { type WatchOutcome } from './types.mjs';
import { log, sh } from './util.mjs';

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
 * Writes this run into the log, or says why it could not.
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
    // reading; the cap is what keeps one run from filling the file.
    events: mut_events.slice(-RUN_LOG_MAX_EVENTS),
  } as const;

  const existing = await readLog();

  if (Result.isErr(existing)) return existing;

  const runs = Arr.toUnshifted(entry)(existing.value?.runs ?? []).slice(
    0,
    RUN_LOG_MAX_RUNS,
  );

  const next: UnblockPrsLog = { version: RUN_LOG_VERSION, runs } as const;

  const written = await writeLog(serializeRunLog(next));

  return Result.isErr(written) ? written : Result.ok('published');
};

/**
 * The log as it is now, or `undefined` when there is not one yet.
 *
 * The branch is asked about before the file is, because "no branch" is the
 * first run and not a failure, and `git ls-remote` says so by answering
 * nothing rather than by failing — which is what keeps this from having to
 * tell a 404 apart from a network error by reading its text.
 */
const readLog = async (): Promise<
  Result<UnblockPrsLog | undefined, string>
> => {
  const origin = await originUrl();

  if (Result.isErr(origin)) return origin;

  const ref = `refs/heads/${RUN_LOG_BRANCH}` as const;

  const shown = await inScratchRepo(async (dir) => {
    const listed = await git(
      `git ls-remote --heads ${sh(origin.value)} ${sh(ref)}`,
      dir,
    );

    if (Result.isErr(listed)) return listed;

    if (listed.value.trim() === '') return Result.ok(undefined);

    // Into `FETCH_HEAD` of a repository that is about to be deleted, so no
    // ref is created anywhere that outlives this call.
    const fetched = await git(
      `git fetch --quiet --depth 1 ${sh(origin.value)} ${sh(ref)}`,
      dir,
    );

    if (Result.isErr(fetched)) return fetched;

    return git(`git show ${sh(`FETCH_HEAD:${RUN_LOG_PATH}`)}`, dir);
  });

  if (Result.isErr(shown)) return shown;

  if (shown.value === undefined) return Result.ok(undefined);

  const parsed = parseRunLog(shown.value);

  // A file this version cannot read is not a reason to lose this run: the
  // entry is prepended to nothing and the unreadable one is overwritten,
  // which is the same thing that happens when the cap drops the oldest run.
  return Result.ok(Result.isErr(parsed) ? undefined : parsed.value);
};

/**
 * A fresh repository each time, so the branch is one commit holding one file
 * however long this goes on. Nothing is checked out and nothing is merged,
 * so there is no state for a half-finished run to leave behind.
 */
const writeLog = async (
  contents: string,
): Promise<Result<undefined, string>> => {
  const origin = await originUrl();

  if (Result.isErr(origin)) return origin;

  return inScratchRepo(async (dir) => {
    // The path is this function's own: the directory came from `mkdtemp` and
    // nothing outside chose either half of it.
    const written = await Result.fromPromise(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFile(path.join(dir, RUN_LOG_PATH), contents),
    );

    if (Result.isErr(written)) {
      return Result.err(`could not write the log: ${String(written.value)}`);
    }

    const steps: readonly string[] = [
      `git add ${sh(RUN_LOG_PATH)}`,
      // `commit.gpgsign` is off for this one commit: it is machine output,
      // and a global signing setting would otherwise make the log fail on a
      // machine with no key loaded.
      // Committed as whoever ran this, out of their own git configuration.
      // The push goes out under their credentials either way, so naming an
      // author here would only have made the branch say something less true
      // than what it already knew — and `unblock-prs@users.noreply.github.com`
      // is not an account that exists.
      `git -c commit.gpgsign=false commit --quiet --message ${sh('chore(unblock-prs): publish the run log')}`,
      `git push --quiet --force ${sh(origin.value)} ${sh(`HEAD:refs/heads/${RUN_LOG_BRANCH}`)}`,
    ] as const;

    for (const step of steps) {
      // Sequential because each one depends on the last; a `Promise.all` here
      // would be a repository with no commit being pushed.

      const ran = await git(step, dir);

      if (Result.isErr(ran)) return ran;
    }

    return Result.ok(undefined);
  });
};

/**
 * **The one thing this module asks of the repository the script was run
 * from, and it only reads it.** Everything that talks to the remote happens
 * in a scratch repository below, so neither the log's branch nor a
 * `FETCH_HEAD` ever appears in the working copy — which would be a surprise
 * to someone whose branch list grew a `data/` entry they never asked for.
 */
const originUrl = async (): Promise<Result<string, string>> => {
  const origin = await git('git remote get-url origin');

  return Result.isErr(origin) ? origin : Result.ok(origin.value.trim());
};

/**
 * A throwaway repository for one piece of work, removed however that work
 * ends.
 */
const inScratchRepo = async <T,>(
  body: (scratch: string) => Promise<Result<T, string>>,
): Promise<Result<T, string>> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'unblock-prs-log-'));

  try {
    const init = await git('git init --quiet --initial-branch=main', dir);

    if (Result.isErr(init)) return init;

    const hooks = await git('git config core.hooksPath /dev/null', dir);

    if (Result.isErr(hooks)) return hooks;

    return await body(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

/**
 * Said by `main.mts` once the loop is over, in every case including the one
 * where there was nothing to write.
 *
 * Silence there was a mistake: a run that acted on nothing looked exactly
 * like a run whose log had failed, and the only way to tell them apart was
 * to go and look at whether the branch existed.
 */
export const reportRunLog = (
  result: Result<'nothing-to-say' | 'published', string>,
): void => {
  if (Result.isErr(result)) {
    log(`Could not write the run log to ${RUN_LOG_BRANCH}: ${result.value}`);
  } else if (result.value === 'published') {
    log(`Wrote this run to ${RUN_LOG_BRANCH}.`);
  } else {
    log(
      `Nothing to write to ${RUN_LOG_BRANCH}: this run did not act on anything.`,
    );
  }
};
