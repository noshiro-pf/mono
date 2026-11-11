/**
 * `run-issue-resolver`: starts the open issues nobody has started, one
 * `claude -p` session each, on the Claude API and without a person
 * (`spec/commands.md`, `run-issue-resolver`). Each look reads how every open
 * issue stands for being started, as `startable-issues` does, and starts a
 * session only on one that is startable and that one of the authors wrote
 * ({@link surveyIssues}). A look that finds nothing costs GitHub requests and
 * no tokens.
 *
 * **Up to `--concurrency` sessions at once**, each on an issue of its own and in
 * a worktree of its own, which the command makes from the latest `origin/main`
 * and removes after ({@link runPool} says when the next one starts). Two
 * sessions are never on one issue: the pool keeps one it is running out of the
 * next look, and `start-issue` refuses one another run of the command claimed.
 *
 * **What a session may spend follows what issues cost** (`capForNext` in
 * `pool.mts`). **One issue per session**, so that a cost is per issue and what
 * a session was handed is exactly what it tried. This command runs
 * `start-issue` on it first, so that the `in-progress` label is its own to take
 * off again; what the session is told is `issueInstructions` in `session.mts`.
 *
 * An issue the session ended on without a pull request that closes it has the
 * label taken off, and is not handed on again until someone changes it, across
 * runs of the command (the record, `state/attempted.mts`). It starts no more
 * sessions after the first that does not get going, since each try labels an
 * issue and takes the label off again, and once `--max-sessions` sessions have
 * run; it exits once the sessions running have ended.
 */

import {
  apartFrom,
  heldThemes,
  IssueLabel,
  surveyIssues,
  withoutHeldThemes,
  type IssueDecision,
  type StartableIssue,
} from 'pr-report-core-v2';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import {
  describeOutcome,
  mayHaveSpent,
  oneAtATime,
  sessionEnv,
  type ClaudeOutcome,
  type InitEvent,
} from '../../agent/index.mjs';
import { shellQuote } from '../../git/index.mjs';
import { issueNumbers, passedOverNotes } from '../startable-issues/index.mjs';
import type { RunIssueResolverOptions } from './options.mjs';
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
import { hitItsCap, judgeIssueSession, type IssueAfter } from './verdict.mjs';

export const runIssueResolver = async (
  options: RunIssueResolverOptions,
  world: RunIssueResolverWorld,
): Promise<Result<undefined, string>> => {
  if (!options.dryRun && (world.env['ANTHROPIC_API_KEY'] ?? '') === '') {
    return Result.err(
      'ANTHROPIC_API_KEY is not set. This command runs the sessions on the Claude API and never on a subscription.',
    );
  }

  const authors = Arr.isNonEmpty(options.authors)
    ? options.authors
    : ([world.viewer] as const);

  const loaded = await world.readRecord();

  if (Result.isErr(loaded)) {
    return loaded;
  }

  const { env, dropped } = sessionEnv(world.env);

  if (!options.dryRun && Arr.isNonEmpty(dropped)) {
    world.log(
      `Leaving ${dropped.join(', ')} out of the sessions' environment, so that they bill ANTHROPIC_API_KEY.`,
    );
  }

  world.log(
    `Starting issues written by ${authors.join(', ')}, at most ${options.maxSessions} sessions, ${options.concurrency} at once, ${usd(options.maxTotalUsd)} in all.`,
  );

  // Each issue handed to a session, with its `updatedAt` as the session left
  // it. Never forgotten by its absence from a survey: a page of the issue list
  // read while the list moves can miss one that is still open.
  const mut_attempted = new Map<number, string | undefined>(loaded.value);

  // Each issue a session's cap stopped, held for this run alone: a later one
  // may cap a session on it higher.
  const mut_cutOff = new Map<number, string | undefined>();

  // The record is read again before each write, so that a second run of the
  // command on the same repository keeps what the first one wrote, and written
  // one at a time however many sessions end together.
  const inRecord = oneAtATime();

  const run: Run = {
    world,
    env,
    authors,
    model: options.model,
    inRepo: oneAtATime(),
    claimant: world.newClaimant(),
    keep: {
      record: async (number, updatedAt) => {
        // Kept for the rest of this run when the file cannot be written.
        mut_attempted.set(number, updatedAt);

        const written = await inRecord(async () => {
          const current = await world.readRecord();

          return Result.isErr(current)
            ? current
            : world.writeRecord(
                new Map<number, string | undefined>([
                  ...current.value,
                  [number, updatedAt],
                ]),
              );
        });

        if (Result.isErr(written)) {
          world.log(written.value);
        }
      },
      holdForThisRun: (number, updatedAt) => {
        mut_cutOff.set(number, updatedAt);
      },
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
      survey: async () => survey(run, options, mut_attempted, mut_cutOff),
      run: async (next, capUsd) =>
        runIssue(run, roundOf(run, next, capUsd), next),
      pause: world.pause,
      stopRequested: world.stopRequested,
      now: world.nowEpochMs,
      log: world.log,
      apart: apartFrom,
    },
  );
};

export type RunIssueResolverWorld = Readonly<{
  env: Readonly<NodeJS.ProcessEnv>;
  /** The checkout the command runs in, which every worktree is made from. */
  root: string;
  /** The account the token authenticates as: the authors by default. */
  viewer: string;
  log: (line: string) => void;
  stopRequested: () => boolean;
  nowEpochMs: () => number;
  /** Sleeps `ms`, or until `signal` aborts or a stop is requested. */
  pause: (ms: number, signal: Readonly<AbortSignal>) => Promise<void>;
  /** The open issues as `decideQueue` decides them. */
  readIssues: () => Promise<Result<readonly IssueDecision[], string>>;
  /** The record (`state/attempted.mts`) as its file holds it now. */
  readRecord: () => Promise<
    Result<ReadonlyMap<number, string | undefined>, string>
  >;
  writeRecord: (
    record: ReadonlyMap<number, string | undefined>,
  ) => Promise<Result<undefined, string>>;
  /** `start-issue <number> --by <by>`, or with `--release`. */
  startIssue: (
    number: number,
    by: string,
    mode: 'release' | 'start',
  ) => Promise<Result<string, string>>;
  /** How the issue stands once its session ended. */
  readIssueAfter: (number: number) => Promise<Result<IssueAfter, string>>;
  /** When the issue last changed. */
  readUpdatedAt: (number: number) => Promise<Result<string, string>>;
  /** A word unique to this run, which `start-issue` names. */
  newClaimant: () => string;
  /** A new, empty directory for a session, under the state root. */
  makeSessionDir: () => Promise<string>;
  /** The path a dry run names for the directory it would make. */
  sessionDirPattern: string;
  /**
   * `git fetch origin main` (said and gone past when it fails) and
   * `git worktree add --detach <worktree> origin/main`.
   */
  addWorktree: (
    worktree: string,
    number: number,
  ) => Promise<Result<unknown, string>>;
  /** `git worktree prune`. */
  pruneWorktrees: () => Promise<Result<unknown, string>>;
  removeDir: (dir: string) => Promise<void>;
  runClaude: (
    cwd: string,
    args: readonly string[],
    env: Readonly<NodeJS.ProcessEnv>,
    check: (init: InitEvent) => Result<undefined, string>,
    say: (line: string) => void,
  ) => Promise<ClaudeOutcome>;
}>;

/** A startable issue, with the themes the pool keeps apart. */
type Candidate = StartableIssue;

/** Where an issue a session ended on is kept from being handed on again. */
type Keep = Readonly<{
  /** In the record, across runs, until someone changes the issue. */
  record: (number: number, updatedAt: string | undefined) => Promise<void>;
  /** For this run alone, for one its cap stopped. */
  holdForThisRun: (number: number, updatedAt: string | undefined) => void;
}>;

/** What every session of the run is started from. */
type Run = Readonly<{
  world: RunIssueResolverWorld;
  /** The session's environment, with every other credential left out. */
  env: Readonly<NodeJS.ProcessEnv>;
  authors: readonly string[];
  model: string | undefined;
  /**
   * Runs git work on the checkout one task at a time: sessions starting or
   * ending together would contend for its refs and its worktree records.
   */
  inRepo: <T>(task: () => Promise<T>) => Promise<T>;
  /**
   * Who `start-issue` says started each issue: this run of the command, which
   * is what releases it again.
   */
  claimant: string;
  keep: Keep;
}>;

/** What a session on `next` is started with, but for its directory. */
const roundOf = (
  run: Run,
  next: Candidate,
  capUsd: number,
): StrictOmit<IssueRound, 'workDir'> =>
  ({
    number: next.number,
    url: next.url,
    authors: run.authors,
    maxBudgetUsd: capUsd,
    model: run.model,
  }) as const;

/**
 * What a look finds to start, and what it has to leave; in a dry run, says what
 * it would start and offers nothing. An issue below `priority:S` mainly about a
 * theme a started issue is on — another session's, a `/resolve-issues` run's,
 * or one this run started — is held back (#3598); within one pick, the pool's
 * `apart` keeps sessions started together off one theme.
 */
const survey = async (
  run: Run,
  options: RunIssueResolverOptions,
  mut_attempted: Map<number, string | undefined>,
  cutOff: ReadonlyMap<number, string | undefined>,
): Promise<
  Result<Readonly<{ fresh: readonly Candidate[]; notes: string }>, RunError>
> => {
  const { world } = run;

  const issues = await world.readIssues();

  if (Result.isErr(issues)) {
    return Result.err({
      fatal: false,
      message: `cannot read the issues: ${issues.value}`,
    });
  }

  // What another run of the command on the same repository has recorded since.
  const recorded = await world.readRecord();

  if (Result.isErr(recorded)) {
    return Result.err({ fatal: true, message: recorded.value });
  }

  for (const [number, updatedAt] of recorded.value) {
    mut_attempted.set(number, updatedAt);
  }

  // One held for this run is held as a recorded one is, while it stands.
  const surveyed = surveyIssues(issues.value, {
    authors: run.authors,
    attempted: new Map<number, string | undefined>([
      ...mut_attempted,
      ...cutOff,
    ]),
  });

  const held = heldThemes(issues.value, undefined);

  const picked = withoutHeldThemes(surveyed.fresh, held.held);

  const stoppedAtCap = surveyed.left.filter(
    (number) => cutOff.has(number) && !mut_attempted.has(number),
  );

  const notes = [
    ...(Arr.isNonEmpty(picked.heldBack)
      ? [
          `${issueNumbers(picked.heldBack.map(({ number }) => number))}: startable, but a started issue is on their theme (${Arr.uniq(picked.heldBack.flatMap(({ themes }) => themes)).join(', ')}); waiting until it is free.`,
        ]
      : []),
    ...passedOverNotes(surveyed, run.authors, stoppedAtCap),
    ...(Arr.isNonEmpty(picked.taken) ? [] : ['No issue to start.']),
  ].join('\n');

  if (!options.dryRun) {
    return Result.ok({ fresh: picked.taken, notes });
  }

  // A run starts with one session, until an issue is resolved.
  for (const next of Arr.take(picked.taken, 1)) {
    const workDir = world.sessionDirPattern;

    const wouldRun = issueArgs({
      ...roundOf(run, next, firstCapUsd(options.maxTotalUsd)),
      workDir,
    });

    world.log(
      `Would run start-issue ${next.number}, then make ${issueWorktree(workDir)} from origin/main in ${world.root}, and in it: claude ${wouldRun.map(shellQuote).join(' ')}`,
    );
  }

  return Result.ok({ fresh: [], notes });
};

/**
 * Removes the session's directory, and git's records of the worktrees that went
 * with it, and of no other session's: theirs are still there, and one being
 * added is locked until it is.
 */
const cleanUp = async (run: Run, workDir: string): Promise<void> => {
  await run.world.removeDir(workDir);

  const pruned = await run.inRepo(async () => run.world.pruneWorktrees());

  if (Result.isErr(pruned)) {
    run.world.log(`git worktree prune: ${pruned.value}`);
  }
};

/**
 * Runs one session on the issue in a worktree of its own, made from the latest
 * `origin/main` in a directory of its own and removed after, or resolves to
 * `undefined` when a stop came before it started.
 */
const runSession = async (
  run: Run,
  round: StrictOmit<IssueRound, 'workDir'>,
): Promise<ClaudeOutcome | undefined> => {
  const { world } = run;

  const workDir = await world.makeSessionDir();

  const worktree = issueWorktree(workDir);

  const added = await run.inRepo(async () =>
    world.addWorktree(worktree, round.number),
  );

  if (Result.isErr(added)) {
    await cleanUp(run, workDir);

    return {
      kind: 'refused',
      cause: 'start',
      message: `cannot make a worktree for the session: ${added.value}`,
    };
  }

  // After the last await before the session: a stop that came before it has no
  // session to be passed on to.
  if (world.stopRequested()) {
    await cleanUp(run, workDir);

    return undefined;
  }

  world.log(
    `Starting a session on #${round.number} in ${worktree}, for at most ${usd(round.maxBudgetUsd)}.`,
  );

  // It resolves whatever happens.
  const outcome = await world.runClaude(
    worktree,
    issueArgs({ ...round, workDir }),
    run.env,
    checkIssueInit,
    (line) => {
      world.log(`#${round.number}: ${line}`);
    },
  );

  await cleanUp(run, workDir);

  if (outcome.kind === 'refused') {
    // Stopped before its first event: the stop asked for, not a failure.
    return world.stopRequested() ? undefined : outcome;
  }

  world.log(`#${round.number}: ${describeOutcome(outcome)}`);

  return outcome;
};

/**
 * Starts the issue, runs one session on it, and settles its label and its
 * record; `spent` when the session may have cost anything, which is what
 * `--max-sessions` counts, and `costUsd` what its result says it cost, which is
 * what `--max-total-usd` counts.
 */
const runIssue = async (
  run: Run,
  round: StrictOmit<IssueRound, 'workDir'>,
  next: Candidate,
): Promise<Result<RunOutcome, RunError>> => {
  const { world } = run;

  const notSpent = Result.ok({
    spent: false,
    costUsd: undefined,
    resolved: false,
  } as const);

  // Before anything is spent, and here rather than in the session: a label this
  // command put on is one it may take off again.
  const started = await world
    .startIssue(next.number, run.claimant, 'start')
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(started)) {
    // A refusal is held as it stands, as one a session left: one the survey
    // reads as startable and `start-issue` does not (a stacked pull request
    // closing it, or another run of the command that started it first) would
    // otherwise be picked every look, and nothing behind it ever. Anything else
    // (a 5xx, a token that may not label) is a failure, waited out.
    if (!started.value.startsWith(`#${next.number} not started:`)) {
      return Result.err({ fatal: false, message: started.value });
    }

    world.log(started.value);

    await run.keep.record(next.number, next.updatedAt);

    return notSpent;
  }

  world.log(started.value);

  // Whatever happens from here on, the label is settled below.
  const outcome = await runSession(run, round).catch(
    (error: unknown): ClaudeOutcome => ({
      kind: 'refused',
      cause: 'start',
      message: `cannot start the session: ${unknownToString(error)}`,
    }),
  );

  const after =
    outcome?.kind === 'ran'
      ? await world
          .readIssueAfter(next.number)
          .catch((error: unknown) => Result.err(unknownToString(error)))
      : undefined;

  const { verdict, release } =
    outcome?.kind === 'ran'
      ? judgeIssueSession(
          outcome.result,
          after !== undefined && Result.isOk(after) ? after.value : undefined,
        )
      : ({ verdict: 'not-started', release: true } as const);

  if (after !== undefined && Result.isErr(after)) {
    world.log(
      `#${next.number}: cannot read it after the session: ${after.value}`,
    );
  }

  if (release) {
    const released = await world
      .startIssue(next.number, run.claimant, 'release')
      .catch((error: unknown) => Result.err(unknownToString(error)));

    world.log(
      Result.isOk(released)
        ? released.value
        : `#${next.number}: cannot take ${IssueLabel.inProgress} off; \`start-issue -- ${next.number} --by ${run.claimant} --release\` does: ${released.value}`,
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

  if (spent && !world.stopRequested()) {
    const settled = await world
      .readUpdatedAt(next.number)
      .catch((error: unknown) => Result.err(unknownToString(error)));

    const updatedAt = Result.isOk(settled) ? settled.value : undefined;

    if (cutOff) {
      run.keep.holdForThisRun(next.number, updatedAt);
    } else {
      await run.keep.record(next.number, updatedAt);
    }
  }

  const ran = Result.ok({
    spent,
    costUsd: outcome.result?.costUsd,
    resolved: verdict === 'opened',
  } as const);

  switch (verdict) {
    case 'opened':
      world.log(
        `#${next.number}: ${after !== undefined && Result.isOk(after) ? issueNumbers(after.value.closedBy) : 'a pull request'} closes it now.`,
      );

      return ran;

    case 'closed':
      world.log(
        `#${next.number}: closed — found already done by the session, or closed meanwhile; its last comment says which.`,
      );

      return ran;

    case 'left':
      world.log(
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
