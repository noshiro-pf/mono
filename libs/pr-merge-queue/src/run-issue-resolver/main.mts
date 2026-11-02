import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { IN_PROGRESS_LABEL } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { StrictOmit } from 'ts-type-forge';
import {
  git,
  log,
  repoRoot,
  resolveApiContext,
  rest,
  sh,
  tokenFromEnv,
  viewerLogin,
  type ApiContext,
} from '../lib/index.mjs';
import { readReport } from '../pr-report/index.mjs';
import {
  describeOutcome,
  mayHaveSpent,
  removeDir,
  runClaude,
  sessionEnv,
  type ClaudeOutcome,
} from '../run-unblock-prs-skill/index.mjs';
import { openPullsClosing, startIssue } from '../start-issue/index.mjs';
import {
  installStopHandlers,
  pause,
  stopRequested,
  WORKTREE_ROOT,
} from '../unblock-prs/index.mjs';
import { attemptedFile, loadAttempted, recordAttempted } from './attempted.mjs';
import type { Options } from './options.mjs';
import { checkIssueInit, issueArgs, type IssueRound } from './session.mjs';
import { HELD_LABELS, surveyIssues } from './survey.mjs';
import { judgeIssueSession, type IssueAfter } from './verdict.mjs';

/**
 * Starts the open issues nobody has started, one `claude -p` session each, on
 * the Claude API and without a person: what a scheduled routine asked to
 * "implement the open issues" does, but on an API key with a budget per
 * session, and choosing the issue without the model. Each round reads how every
 * open issue stands for being started (`docs/issue-start-after.md`, as
 * `pr-report` decides it), and starts a session only on one that is startable
 * and that one of the authors wrote ({@link surveyIssues}). A round that finds
 * nothing costs GitHub requests and no tokens.
 *
 * ```sh
 * run-issue-resolver --max-budget-usd 5            # until --max-sessions or Ctrl+C
 * run-issue-resolver --max-budget-usd 5 --once     # one issue at most
 * run-issue-resolver --max-budget-usd 5 --dry-run  # say what it would run
 * ```
 *
 * **One issue per session**, so that the budget is per issue and what a session
 * was handed is exactly what it tried. This command runs `start-issue` on it
 * first, so that the `in-progress` label is its own to take off again; the
 * session decides whether the issue can be finished unattended, and opens the
 * pull request with `open-pr`, held by `skip-ci` like any other: queueing it
 * stays the author's. What it is told is `issueInstructions` in `session.mts`.
 *
 * An issue the session ended on without a pull request that closes it has the
 * label taken off, and is not handed on again until someone changes it, across
 * runs of the command (`attempted.mts`). It stops for good at the first session
 * that does not get going — not on the API key, no `/code-review`, no `claude`,
 * or a failure before it spent anything — since each try labels an issue and
 * takes the label off again, and once `--max-sessions` sessions have run, since
 * each one may leave a pull request waiting for a person.
 */
export const runIssueResolver = async (
  options: Options,
): Promise<Result<undefined, string>> => {
  if (!options.dryRun && (process.env['ANTHROPIC_API_KEY'] ?? '') === '') {
    return Result.err(
      'ANTHROPIC_API_KEY is not set. This command runs the sessions on the Claude API and never on a subscription.',
    );
  }

  if (tokenFromEnv() === undefined) {
    return Result.err(
      'GH_TOKEN or GITHUB_TOKEN is not set: the issues are read, and the sessions label them and open pull requests, as that account.',
    );
  }

  const context = await resolveApiContext();

  if (Result.isErr(context)) {
    return context;
  }

  const authors = Arr.isNonEmpty(options.authors)
    ? Result.ok(options.authors)
    : Result.map(await viewerLogin(context.value.token), (login) => [login]);

  if (Result.isErr(authors)) {
    return Result.err(
      `cannot read which account GH_TOKEN is, whose issues are started by default (pass --author): ${authors.value}`,
    );
  }

  const root = await repoRoot();

  const stateFile = attemptedFile(WORKTREE_ROOT, context.value.repo);

  const loaded = await loadAttempted(stateFile);

  if (Result.isErr(loaded)) {
    return loaded;
  }

  installStopHandlers();

  log(
    `Starting issues written by ${authors.value.join(', ')}, at most ${options.maxSessions} sessions.`,
  );

  // Each issue handed to a session, with its `updatedAt` as the session left
  // it. Never forgotten by its absence from a survey: a page of the issue list
  // read while the list moves can miss one that is still open.
  const mut_attempted = new Map<number, string | undefined>(loaded.value);

  let mut_sessions = 0;

  // What the last round said it is waiting on.
  let mut_lastNotes = '';

  while (!stopRequested()) {
    if (mut_sessions >= options.maxSessions) {
      log(
        `${mut_sessions} sessions have run, as many as --max-sessions allows; stopping.`,
      );

      break;
    }

    // A throw (a full temporary directory, say) is one failed round, not the
    // end of a command meant to be left running.
    const round: RoundResult = await runRound(
      root,
      context.value,
      authors.value,
      options,
      stateFile,
      mut_attempted,
    ).catch((error: unknown) =>
      Result.err({ fatal: false, message: unknownToString(error) } as const),
    );

    if (Result.isOk(round) && round.value.spent) {
      mut_sessions += 1;
    }

    if (Result.isOk(round) && round.value.ran) {
      mut_lastNotes = '';
    }

    // Said again only when it changes, as `run-unblock-prs-skill` does.
    const waiting =
      Result.isOk(round) && !round.value.ran ? round.value.notes : undefined;

    const changed = waiting !== undefined && waiting !== mut_lastNotes;

    if (changed) {
      mut_lastNotes = waiting;

      if (waiting !== '') {
        log(waiting);
      }
    }

    if (Result.isErr(round)) {
      if (options.once || round.value.fatal) {
        return Result.err(round.value.message);
      }

      log(round.value.message);
    }

    if (options.once || stopRequested()) {
      break;
    }

    if (Result.isOk(round) && round.value.ran) {
      continue;
    }

    if (changed || Result.isErr(round)) {
      log(`Checking again every ${options.intervalMin} min.`);
    }

    await pause(options.intervalMin * 60_000);
  }

  return Result.ok(undefined);
};

/**
 * `ran` when a session ran, so that the next round starts at once; `spent`
 * when it may have cost anything, which is what `--max-sessions` counts;
 * `notes`, what the survey found it has to leave.
 */
type RoundResult = Result<
  Readonly<{ ran: boolean; spent: boolean; notes: string }>,
  RoundError
>;

type RoundError = Readonly<{ fatal: boolean; message: string }>;

/**
 * Every open issue, up to a thousand, rather than the report's thirty: the
 * oldest are as startable as the newest, and the survey reads them all.
 */
const ISSUES_LIMIT = 1000;

const IssueSchema = t.record({
  state: t.string(),
  updated_at: t.string(),
});

/** Whether the issue is open, and when it last changed. */
const readIssue = async (
  context: ApiContext,
  number: number,
): Promise<Result<Readonly<{ open: boolean; updatedAt: string }>, string>> =>
  Result.map(
    await rest(context, 'GET', `/issues/${number}`, IssueSchema).catch(
      (error: unknown) => Result.err(unknownToString(error)),
    ),
    (issue) => ({ open: issue.state === 'open', updatedAt: issue.updated_at }),
  );

/** How the issue stands once its session ended. */
const readIssueAfter = async (
  context: ApiContext,
  number: number,
): Promise<Result<IssueAfter, string>> => {
  const [issue, closedBy] = await Promise.all([
    readIssue(context, number),
    openPullsClosing(context, number),
  ]).catch((error: unknown) => {
    const failed = Result.err(unknownToString(error));

    return [failed, failed] as const;
  });

  return Result.isErr(issue)
    ? issue
    : Result.isErr(closedBy)
      ? closedBy
      : Result.ok({ open: issue.value.open, closedBy: closedBy.value });
};

/**
 * Adds the issue to the record, in the file and in `mut_attempted`, which keeps
 * it for the rest of this run when the file cannot be written.
 */
const record = async (
  file: string,
  mut_attempted: Map<number, string | undefined>,
  number: number,
  updatedAt: string | undefined,
): Promise<void> => {
  mut_attempted.set(number, updatedAt);

  const recorded = await recordAttempted(file, number, updatedAt);

  if (Result.isErr(recorded)) {
    log(recorded.value);
  }
};

const numbers = (list: readonly number[]): string =>
  list.map((number) => `#${number}`).join(', ');

/**
 * Runs one session on the issue in a directory of its own, removed after, or
 * resolves to `undefined` when a stop came before it started.
 */
const runSession = async (
  root: string,
  round: StrictOmit<IssueRound, 'workDir'>,
): Promise<ClaudeOutcome | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path of the worker's
  await fs.mkdir(WORKTREE_ROOT, { recursive: true });

  const workDir = await fs.mkdtemp(
    path.join(WORKTREE_ROOT, 'run-issue-resolver-'),
  );

  // After the last await before the session: a stop that came before it has no
  // session to be passed on to.
  if (stopRequested()) {
    await removeDir(workDir);

    return undefined;
  }

  const { env, dropped } = sessionEnv(process.env);

  if (Arr.isNonEmpty(dropped)) {
    log(
      `Leaving ${dropped.join(', ')} out of the session's environment, so that it bills ANTHROPIC_API_KEY.`,
    );
  }

  log(
    `Starting a session on #${round.number}, for at most $${round.maxBudgetUsd}.`,
  );

  // It resolves whatever happens.
  const outcome = await runClaude(
    root,
    issueArgs({ ...round, workDir }),
    env,
    checkIssueInit,
  );

  await removeDir(workDir);

  if (outcome.kind === 'refused') {
    // Stopped before its first event: the stop asked for, not a failure.
    return stopRequested() ? undefined : outcome;
  }

  log(`#${round.number}: ${describeOutcome(outcome)}`);

  // The worktrees went with the directory; this drops git's records of them.
  const pruned = await git('git worktree prune', root);

  if (Result.isErr(pruned)) {
    log(`git worktree prune: ${pruned.value}`);
  }

  return outcome;
};

/** One survey, and at most one session. */
const runRound = async (
  root: string,
  context: ApiContext,
  authors: readonly string[],
  options: Options,
  stateFile: string,
  mut_attempted: Map<number, string | undefined>,
): Promise<RoundResult> => {
  // The repository the record and the labels are of, not whatever `origin` says
  // by the time this reads it.
  const read = await readReport({
    repo: `${context.repo.owner}/${context.repo.name}`,
    mergedDays: 1,
    mergedLimit: 1,
    issuesLimit: ISSUES_LIMIT,
  });

  if (Result.isErr(read)) {
    return Result.err({
      fatal: false,
      message: `cannot read the issues: ${read.value}`,
    });
  }

  // What another run of the command on the same repository has recorded since.
  const recorded = await loadAttempted(stateFile);

  if (Result.isErr(recorded)) {
    return Result.err({ fatal: true, message: recorded.value });
  }

  for (const [number, updatedAt] of recorded.value) {
    mut_attempted.set(number, updatedAt);
  }

  const survey = surveyIssues(
    read.value.report.issues,
    new Set<string>(authors),
    mut_attempted,
  );

  const notes = [
    ...(Arr.isNonEmpty(survey.left)
      ? [
          `${numbers(survey.left)}: an earlier session left them as they stand; waiting for someone to change them.`,
        ]
      : []),
    ...(Arr.isNonEmpty(survey.foreign)
      ? [
          `${numbers(survey.foreign)}: startable, but not written by ${authors.join(' or ')}; left to a person.`,
        ]
      : []),
    ...(Arr.isNonEmpty(survey.held)
      ? [
          `${numbers(survey.held)}: startable, but labelled ${HELD_LABELS.join(', ')} or the like; left as they are.`,
        ]
      : []),
    ...(Arr.isNonEmpty(survey.fresh) ? [] : ['No issue to start.']),
  ].join('\n');

  const idle = Result.ok({ ran: false, spent: false, notes } as const);

  if (!Arr.isNonEmpty(survey.fresh)) {
    return idle;
  }

  const [next] = survey.fresh;

  const round = {
    number: next.number,
    url: next.url,
    authors,
    maxBudgetUsd: options.maxBudgetUsd,
    model: options.model,
  } as const;

  if (options.dryRun) {
    const wouldRun = issueArgs({
      ...round,
      workDir: path.join(WORKTREE_ROOT, 'run-issue-resolver-XXXXXX'),
    });

    log(
      `Would run start-issue ${next.number}, then, in ${root}: claude ${wouldRun.map(sh).join(' ')}`,
    );

    return idle;
  }

  // Before anything is spent, and here rather than in the session: a label this
  // command put on is one it may take off again.
  const started = await startIssue({
    number: next.number,
    mode: 'start',
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(started)) {
    // A refusal is held as it stands, as one a session left: one the report
    // reads as startable and `start-issue` does not (a stacked pull request
    // closing it, which the report's GraphQL does not count) would otherwise be
    // picked every round, and nothing behind it ever. Anything else (a 5xx, a
    // token that may not label) is a failed round, waited out.
    if (!started.value.startsWith(`#${next.number} not started:`)) {
      return Result.err({ fatal: false, message: started.value });
    }

    log(started.value);

    await record(stateFile, mut_attempted, next.number, next.updatedAt);

    return Result.ok({ ran: true, spent: false, notes } as const);
  }

  log(started.value);

  // Whatever happens from here on, the label is settled below.
  const outcome = await runSession(root, round).catch(
    (error: unknown): ClaudeOutcome => ({
      kind: 'refused',
      cause: 'start',
      message: `cannot start the session: ${unknownToString(error)}`,
    }),
  );

  const after =
    outcome?.kind === 'ran'
      ? await readIssueAfter(context, next.number)
      : undefined;

  const { verdict, release } =
    outcome?.kind === 'ran'
      ? judgeIssueSession(
          outcome.result,
          after !== undefined && Result.isOk(after) ? after.value : undefined,
        )
      : ({ verdict: 'not-started', release: true } as const);

  if (after !== undefined && Result.isErr(after)) {
    log(`#${next.number}: cannot read it after the session: ${after.value}`);
  }

  if (release) {
    const released = await startIssue({
      number: next.number,
      mode: 'release',
    }).catch((error: unknown) => Result.err(unknownToString(error)));

    log(
      Result.isOk(released)
        ? released.value
        : `#${next.number}: cannot take ${IN_PROGRESS_LABEL} off; \`start-issue -- ${next.number} --release\` does: ${released.value}`,
    );
  }

  if (outcome === undefined) {
    return idle;
  }

  // Every try labels an issue and takes the label off again, so one that cannot
  // start a session (a key out of credit, a directory it cannot write) stops
  // the command rather than doing that every round.
  if (outcome.kind === 'refused') {
    return Result.err({ fatal: true, message: outcome.message });
  }

  const spent = mayHaveSpent(outcome.result);

  // Read last, once the label is off: what the next survey compares. One that
  // cannot be read is held until the record is removed, rather than paid for
  // again on the strength of a change that may be this command's own. One a
  // stop cut short is not held: the session decided nothing.
  if (spent && !stopRequested()) {
    const settled = await readIssue(context, next.number);

    await record(
      stateFile,
      mut_attempted,
      next.number,
      Result.isOk(settled) ? settled.value.updatedAt : undefined,
    );
  }

  const ran = Result.ok({ ran: true, spent, notes } as const);

  switch (verdict) {
    case 'opened':
      log(
        `#${next.number}: ${after !== undefined && Result.isOk(after) ? numbers(after.value.closedBy) : 'a pull request'} closes it now.`,
      );

      return ran;

    case 'closed':
      log(`#${next.number}: closed.`);

      return ran;

    case 'left':
      log(
        `#${next.number}: left with no pull request that closes it; not handed on again until someone changes it.`,
      );

      return ran;

    // As a session that cannot start: every look would label an issue again.
    case 'not-started':
      return Result.err({
        fatal: true,
        message: `#${next.number}: the session failed before spending anything; its log above says why.`,
      });
  }
};
