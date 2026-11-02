import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { IN_PROGRESS_LABEL } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { StrictOmit } from 'ts-type-forge';
import {
  git,
  log,
  oneAtATime,
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
import {
  attemptedFile,
  attemptedRecorder,
  loadAttempted,
} from './attempted.mjs';
import type { Options } from './options.mjs';
import {
  firstCapUsd,
  runPool,
  usd,
  type RunError,
  type RunOutcome,
} from './pool.mjs';
import {
  checkIssueInit,
  issueArgs,
  issueWorktree,
  type IssueRound,
} from './session.mjs';
import { HELD_LABELS, surveyIssues, type IssueCandidate } from './survey.mjs';
import { hitItsCap, judgeIssueSession, type IssueAfter } from './verdict.mjs';

/**
 * Starts the open issues nobody has started, one `claude -p` session each, on
 * the Claude API and without a person: what a scheduled routine asked to
 * "implement the open issues" does, but on an API key with a budget for the
 * run, and choosing the issue without the model. Each look reads how every open
 * issue stands for being started (`docs/issue-start-after.md`, as `pr-report`
 * decides it), and starts a session only on one that is startable and that one
 * of the authors wrote ({@link surveyIssues}). A look that finds nothing costs
 * GitHub requests and no tokens.
 *
 * ```sh
 * run-issue-resolver --max-total-usd 20            # until the budget, --max-sessions or Ctrl+C
 * run-issue-resolver --max-total-usd 20 --once     # one look, --concurrency issues at most
 * run-issue-resolver --max-total-usd 20 --dry-run  # say what it would run
 * ```
 *
 * **Up to `--concurrency` sessions at once**, each on an issue of its own and in
 * a worktree of its own, which the command makes from the latest `origin/main`
 * and removes after ({@link runPool} says when the next one starts), so that no
 * session works in the checkout the others start from. Two sessions are never on one issue: the pool
 * keeps one it is running out of the next look, and `start-issue` refuses one
 * labelled `in-progress` by another run of the command.
 *
 * **What a session may spend follows what issues cost.** Until one resolves its
 * issue, sessions run one at a time, each capped at a quarter of
 * `--max-total-usd`; after, each is capped at a multiple of what a resolved
 * issue has cost on average, and as many run as the budget holds those caps for
 * (`capForNext` in `pool.mts`).
 *
 * **One issue per session**, so that a cost is per issue and what a session was
 * handed is exactly what it tried. This command runs `start-issue` on it first,
 * so that the `in-progress` label is its own to take off again; the session
 * decides whether the issue can be finished unattended, and opens the pull
 * request with `open-pr`, held by `skip-ci` like any other: queueing it stays
 * the author's. What it is told is `issueInstructions` in `session.mts`.
 *
 * An issue the session ended on without a pull request that closes it has the
 * label taken off, and is not handed on again until someone changes it, across
 * runs of the command (`attempted.mts`). It starts no more sessions after the
 * first that does not get going — not on the API key, no `/code-review`, no `claude`,
 * or a failure before it spent anything — since each try labels an issue and
 * takes the label off again, and once `--max-sessions` sessions have run, since
 * each one may leave a pull request waiting for a person; it exits once the
 * sessions running have ended.
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

  const { env, dropped } = sessionEnv(process.env);

  if (!options.dryRun && Arr.isNonEmpty(dropped)) {
    log(
      `Leaving ${dropped.join(', ')} out of the sessions' environment, so that they bill ANTHROPIC_API_KEY.`,
    );
  }

  const shared: Shared = { root, env, inRepo: oneAtATime() } as const;

  installStopHandlers();

  log(
    `Starting issues written by ${authors.value.join(', ')}, at most ${options.maxSessions} sessions, ${options.concurrency} at once, ${usd(options.maxTotalUsd)} in all.`,
  );

  // Each issue handed to a session, with its `updatedAt` as the session left
  // it. Never forgotten by its absence from a survey: a page of the issue list
  // read while the list moves can miss one that is still open.
  const mut_attempted = new Map<number, string | undefined>(loaded.value);

  const recordInFile = attemptedRecorder(stateFile);

  const record = async (
    number: number,
    updatedAt: string | undefined,
  ): Promise<void> => {
    // Kept for the rest of this run when the file cannot be written.
    mut_attempted.set(number, updatedAt);

    const recorded = await recordInFile(number, updatedAt);

    if (Result.isErr(recorded)) {
      log(recorded.value);
    }
  };

  // Each issue a session's cap stopped, held for this run alone: a later one
  // may cap a session on it higher.
  const mut_cutOff = new Map<number, string | undefined>();

  const keep: Keep = {
    record,
    holdForThisRun: (number, updatedAt) => {
      mut_cutOff.set(number, updatedAt);
    },
  } as const;

  return runPool(
    {
      concurrency: options.concurrency,
      maxSessions: options.maxSessions,
      once: options.once,
      intervalMs: options.intervalMin * 60_000,
      totalUsd: options.maxTotalUsd,
    },
    {
      survey: async () =>
        survey(
          root,
          context.value,
          authors.value,
          options,
          stateFile,
          mut_attempted,
          mut_cutOff,
        ),
      run: async (next, capUsd) =>
        runIssue(
          shared,
          context.value,
          roundOf(next, authors.value, options.model, capUsd),
          keep,
          next,
        ),
      pause,
      stopRequested,
      now: Date.now,
      log,
    },
  );
};

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

const numbers = (list: readonly number[]): string =>
  list.map((number) => `#${number}`).join(', ');

/**
 * Removes the session's directory, and git's records of the worktrees that went
 * with it, and of no other session's: theirs are still there, and one being
 * added is locked until it is.
 */
const cleanUp = async (shared: Shared, workDir: string): Promise<void> => {
  await removeDir(workDir);

  const pruned = await shared.inRepo(async () =>
    git('git worktree prune', shared.root),
  );

  if (Result.isErr(pruned)) {
    log(`git worktree prune: ${pruned.value}`);
  }
};

/**
 * Runs one session on the issue in a worktree of its own, made from the latest
 * `origin/main` in a directory of its own and removed after, or resolves to
 * `undefined` when a stop came before it started.
 */
const runSession = async (
  shared: Shared,
  round: StrictOmit<IssueRound, 'workDir'>,
): Promise<ClaudeOutcome | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path of the worker's
  await fs.mkdir(WORKTREE_ROOT, { recursive: true });

  const workDir = await fs.mkdtemp(
    path.join(WORKTREE_ROOT, 'run-issue-resolver-'),
  );

  const worktree = issueWorktree(workDir);

  const added = await shared.inRepo(async () => {
    // Bounded: a fetch stalled on the network would hold every session behind
    // it in the queue.
    const fetched = await git(
      'git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=60 fetch origin main',
      shared.root,
    );

    if (Result.isErr(fetched)) {
      log(
        `#${round.number}: git fetch: ${fetched.value}; starting from origin/main as it stands.`,
      );
    }

    return git(
      `git worktree add --detach ${sh(worktree)} origin/main`,
      shared.root,
    );
  });

  if (Result.isErr(added)) {
    await cleanUp(shared, workDir);

    return {
      kind: 'refused',
      cause: 'start',
      message: `cannot make a worktree for the session: ${added.value}`,
    };
  }

  // After the last await before the session: a stop that came before it has no
  // session to be passed on to.
  if (stopRequested()) {
    await cleanUp(shared, workDir);

    return undefined;
  }

  log(
    `Starting a session on #${round.number} in ${worktree}, for at most ${usd(round.maxBudgetUsd)}.`,
  );

  // It resolves whatever happens.
  const outcome = await runClaude(
    worktree,
    issueArgs({ ...round, workDir }),
    shared.env,
    checkIssueInit,
    (line) => {
      log(`#${round.number}: ${line}`);
    },
  );

  await cleanUp(shared, workDir);

  if (outcome.kind === 'refused') {
    // Stopped before its first event: the stop asked for, not a failure.
    return stopRequested() ? undefined : outcome;
  }

  log(`#${round.number}: ${describeOutcome(outcome)}`);

  return outcome;
};

/** Where an issue a session ended on is kept from being handed on again. */
type Keep = Readonly<{
  /** In the record, across runs, until someone changes the issue. */
  record: (number: number, updatedAt: string | undefined) => Promise<void>;
  /** For this run alone, for one its cap stopped. */
  holdForThisRun: (number: number, updatedAt: string | undefined) => void;
}>;

/** What every session of the run is started from. */
type Shared = Readonly<{
  /** The checkout the command runs in, which every worktree is made from. */
  root: string;
  /** The session's environment, with every other credential left out. */
  env: Readonly<NodeJS.ProcessEnv>;
  /**
   * Runs git work on `root` one task at a time: sessions starting or ending
   * together would contend for its refs and its worktree records.
   */
  inRepo: <T>(task: () => Promise<T>) => Promise<T>;
}>;

/** What a session on `next` is started with, but for its directory. */
const roundOf = (
  next: IssueCandidate,
  authors: readonly string[],
  model: string | undefined,
  capUsd: number,
): StrictOmit<IssueRound, 'workDir'> =>
  ({
    number: next.number,
    url: next.url,
    authors,
    maxBudgetUsd: capUsd,
    model,
  }) as const;

/**
 * What a look finds to start, and what it has to leave; in a dry run, says what
 * it would start and offers nothing.
 */
const survey = async (
  root: string,
  context: ApiContext,
  authors: readonly string[],
  options: Options,
  stateFile: string,
  mut_attempted: Map<number, string | undefined>,
  cutOff: ReadonlyMap<number, string | undefined>,
): Promise<
  Result<
    Readonly<{ fresh: readonly IssueCandidate[]; notes: string }>,
    RunError
  >
> => {
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

  // One held for this run is held as a recorded one is, while it stands.
  const mut_held = new Map(mut_attempted);

  for (const [number, updatedAt] of cutOff) {
    mut_held.set(number, updatedAt);
  }

  const found = surveyIssues(
    read.value.report.issues,
    new Set<string>(authors),
    mut_held,
  );

  const stoppedAtCap = found.left.filter(
    (number) => cutOff.has(number) && !mut_attempted.has(number),
  );

  const left = found.left.filter((number) => !stoppedAtCap.includes(number));

  const notes = [
    ...(Arr.isNonEmpty(left)
      ? [
          `${numbers(left)}: an earlier session left them as they stand; waiting for someone to change them.`,
        ]
      : []),
    ...(Arr.isNonEmpty(stoppedAtCap)
      ? [
          `${numbers(stoppedAtCap)}: a session stopped at its cap; a later run, capping one higher, tries again.`,
        ]
      : []),
    ...(Arr.isNonEmpty(found.foreign)
      ? [
          `${numbers(found.foreign)}: startable, but not written by ${authors.join(' or ')}; left to a person.`,
        ]
      : []),
    ...(Arr.isNonEmpty(found.held)
      ? [
          `${numbers(found.held)}: startable, but labelled ${HELD_LABELS.join(', ')} or the like; left as they are.`,
        ]
      : []),
    ...(Arr.isNonEmpty(found.fresh) ? [] : ['No issue to start.']),
  ].join('\n');

  if (!options.dryRun) {
    return Result.ok({ fresh: found.fresh, notes });
  }

  // A run starts with one session, until an issue is resolved.
  for (const next of Arr.take(found.fresh, 1)) {
    const workDir = path.join(WORKTREE_ROOT, 'run-issue-resolver-XXXXXX');

    const wouldRun = issueArgs({
      ...roundOf(
        next,
        authors,
        options.model,
        firstCapUsd(options.maxTotalUsd),
      ),
      workDir,
    });

    log(
      `Would run start-issue ${next.number}, then make ${issueWorktree(workDir)} from origin/main in ${root}, and in it: claude ${wouldRun.map(sh).join(' ')}`,
    );
  }

  return Result.ok({ fresh: [], notes });
};

/**
 * Starts the issue, runs one session on it, and settles its label and its
 * record; `spent` when the session may have cost anything, which is what
 * `--max-sessions` counts, and `costUsd` what its result says it cost, which is
 * what `--max-total-usd` counts.
 */
const runIssue = async (
  shared: Shared,
  context: ApiContext,
  round: StrictOmit<IssueRound, 'workDir'>,
  keep: Keep,
  next: IssueCandidate,
): Promise<Result<RunOutcome, RunError>> => {
  const notSpent = Result.ok({
    spent: false,
    costUsd: undefined,
    resolved: false,
  } as const);

  // Before anything is spent, and here rather than in the session: a label this
  // command put on is one it may take off again.
  const started = await startIssue({
    number: next.number,
    mode: 'start',
  }).catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(started)) {
    // A refusal is held as it stands, as one a session left: one the report
    // reads as startable and `start-issue` does not (a stacked pull request
    // closing it, which the report's GraphQL does not count, or another run of
    // the command that started it first) would otherwise be picked every look,
    // and nothing behind it ever. Anything else (a 5xx, a token that may not
    // label) is a failure, waited out.
    if (!started.value.startsWith(`#${next.number} not started:`)) {
      return Result.err({ fatal: false, message: started.value });
    }

    log(started.value);

    await keep.record(next.number, next.updatedAt);

    return notSpent;
  }

  log(started.value);

  // Whatever happens from here on, the label is settled below.
  const outcome = await runSession(shared, round).catch(
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
    return notSpent;
  }

  // Every try labels an issue and takes the label off again, so one that cannot
  // start a session (a key out of credit, a directory it cannot write) stops
  // the command rather than doing that every look.
  if (outcome.kind === 'refused') {
    return Result.err({
      fatal: true,
      message: `#${next.number}: ${outcome.message}`,
    });
  }

  const spent = mayHaveSpent(outcome.result);

  // Read last, once the label is off: what the next survey compares. One that
  // cannot be read is held until the record is removed, rather than paid for
  // again on the strength of a change that may be this command's own. One a
  // stop cut short is not held: the session decided nothing.
  const cutOff =
    verdict === 'left' && hitItsCap(outcome.result, round.maxBudgetUsd);

  if (spent && !stopRequested()) {
    const settled = await readIssue(context, next.number);

    const updatedAt = Result.isOk(settled)
      ? settled.value.updatedAt
      : undefined;

    if (cutOff) {
      keep.holdForThisRun(next.number, updatedAt);
    } else {
      await keep.record(next.number, updatedAt);
    }
  }

  const ran = Result.ok({
    spent,
    costUsd: outcome.result?.costUsd,
    resolved: verdict === 'opened',
  } as const);

  switch (verdict) {
    case 'opened':
      log(
        `#${next.number}: ${after !== undefined && Result.isOk(after) ? numbers(after.value.closedBy) : 'a pull request'} closes it now.`,
      );

      return ran;

    case 'closed':
      log(
        `#${next.number}: closed — found already done by the session, or closed meanwhile; its last comment says which.`,
      );

      return ran;

    case 'left':
      log(
        cutOff
          ? `#${next.number}: stopped at its ${usd(round.maxBudgetUsd)} cap with no pull request that closes it; not handed on again in this run.`
          : `#${next.number}: left with no pull request that closes it; not handed on again until someone changes it.`,
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
