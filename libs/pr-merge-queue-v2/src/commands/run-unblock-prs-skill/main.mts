/**
 * `run-unblock-prs-skill`: runs the `unblock-prs` skill beside the worker the
 * way `/loop` does in a session, but on the Claude API and without a person
 * (`spec/commands.md`, "The unattended loop"). Each round surveys the queue
 * with the commands' own reading of it ({@link surveyQueue}), and starts
 * `claude -p` on the skill only when a pull request is the skill's to fix. A
 * round that finds nothing costs GitHub requests and no tokens.
 *
 * **One pull request per round**, so that the budget is per pull request and
 * what a round was handed is exactly what it tried: a round that runs out on
 * the first of two would otherwise leave the second marked as tried.
 *
 * What the session may do is `agent/claude.mts`'s; what it is told besides the
 * skill is `roundInstructions` in `round.mts`. A pull request nobody owns is
 * filed by `report-unowned-prs` from here, which needs no model. It stops for
 * good when Claude Code cannot be run as asked — not on the API key, no such
 * skill, no `claude` — since every later round would meet the same; a start
 * that fails after sessions have run is taken as a passing fault instead.
 */

import type { UnownedPullRequest } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import {
  checkInit,
  describeOutcome,
  forgetAllBut,
  mayHaveSpent,
  runRounds,
  sessionEnv,
  type ClaudeOutcome,
  type InitEvent,
  type LoopWorld,
  type RanOutcome,
  type RoundResult,
} from '../../agent/index.mjs';
import { shellQuote } from '../../git/index.mjs';
import type { UnownedOutcome } from '../report-unowned-prs/index.mjs';
import type { RunUnblockPrsSkillOptions } from './options.mjs';
import { claudeArgs } from './round.mjs';
import {
  keyPrefix,
  surveyQueue,
  type Candidate,
  type SurveyedPullRequest,
} from './survey.mjs';
import { judgeSession } from './verdict.mjs';

export const runUnblockPrsSkill = async (
  options: RunUnblockPrsSkillOptions,
  world: RunUnblockPrsSkillWorld,
): Promise<Result<undefined, string>> => {
  if (!options.dryRun && (world.env['ANTHROPIC_API_KEY'] ?? '') === '') {
    return Result.err(
      'ANTHROPIC_API_KEY is not set. This command runs the skill on the Claude API and never on a subscription; with one, run the skill under /loop in a session instead.',
    );
  }

  const skill =
    options.skill ??
    ((await world.skillLinked())
      ? 'unblock-prs'
      : 'pr-merge-queue:unblock-prs');

  const mut_memory: RoundMemory = {
    attempted: new Set<string>(),
    reported: new Set<number>(),
    sessions: new Map<number, number>(),
  };

  let mut_anySessionRan = false;

  return runRounds(
    { once: options.once, intervalMs: options.intervalMin * 60_000 },
    async () => {
      const round = await runRound(
        skill,
        options,
        mut_memory,
        mut_anySessionRan,
        world,
      );

      mut_anySessionRan ||= Result.isOk(round) && round.value.ran;

      return round;
    },
    world,
  );
};

/**
 * Three. A key stops a pull request from being paid for twice as it stands, but
 * a fix that is pushed and fails again stands differently each time, and nobody
 * is watching the loop that makes: after this many sessions on one pull
 * request, it waits for a person, or for this command to restart.
 */
export const MAX_SESSIONS_PER_PR = 3;

/** What a pull request read for a round carries: the survey's and the report's. */
export type RoundPullRequest = SurveyedPullRequest & UnownedPullRequest;

export type RunUnblockPrsSkillWorld = LoopWorld &
  Readonly<{
    env: Readonly<NodeJS.ProcessEnv>;
    /** The repository's root, where the session runs. */
    root: string;
    /** Whether the repository links the skill (`.claude/skills/unblock-prs`). */
    skillLinked: () => Promise<boolean>;
    /** The queue as `pr-report` decides it. */
    readQueue: () => Promise<Result<readonly RoundPullRequest[], string>>;
    /** `report-unowned-prs` on the queue just read. */
    reportUnowned: (
      pullRequests: readonly UnownedPullRequest[],
      dryRun: boolean,
    ) => Promise<UnownedOutcome>;
    /** `claim-pr --release` as `claimant`. */
    releaseClaim: (
      number: number,
      claimant: string,
    ) => Promise<Result<string, string>>;
    /** A word unique to this session, for its claims. */
    newClaimant: () => string;
    /** A new, empty directory for a session's worktrees, under the state root. */
    makeSessionDir: () => Promise<string>;
    /** The path a dry run names for the directory it would make. */
    sessionDirPattern: string;
    removeDir: (dir: string) => Promise<void>;
    runClaude: (
      cwd: string,
      args: readonly string[],
      env: Readonly<NodeJS.ProcessEnv>,
      check: (init: InitEvent) => Result<undefined, string>,
    ) => Promise<ClaudeOutcome>;
    /** `git worktree prune`, for the worktrees that went with the directory. */
    pruneWorktrees: () => Promise<Result<unknown, string>>;
  }>;

/** What a restart forgets: the collections each round updates. */
// transformer-ignore-next-line convert-to-readonly
type RoundMemory = Readonly<{
  /** `Candidate` keys a session has had its try at. */
  attempted: Set<string>;
  /** Pull requests nobody owns, handed to `report-unowned-prs` already. */
  reported: Set<number>;
  /** Sessions run on each pull request, against {@link MAX_SESSIONS_PER_PR}. */
  sessions: Map<number, number>;
}>;

/** What the session came to, read from the queue after it. */
const settle = async (
  next: Candidate,
  outcome: RanOutcome,
  claimant: string,
  mut_memory: RoundMemory,
  /** Whether a session ran before this one. */
  anySessionRan: boolean,
  world: RunUnblockPrsSkillWorld,
): Promise<RoundResult> => {
  const ran = Result.ok({ ran: true, notes: '' } as const);

  const after = await world.readQueue();

  const comments = Result.isOk(after)
    ? after.value.find(({ facts }) => facts.number === next.number)?.comments
    : undefined;

  const { verdict, releaseClaim } = judgeSession(
    outcome.result,
    comments !== undefined && Result.isOk(comments)
      ? comments.value.claim
      : undefined,
    claimant,
  );

  // Unread, the claim may be standing: `claim-pr` reads it again itself, and
  // gives up only one of this claimant's.
  if (releaseClaim || comments === undefined || Result.isErr(comments)) {
    const released = await world.releaseClaim(next.number, claimant);

    world.log(
      Result.isOk(released)
        ? released.value
        : `#${next.number}: cannot release the claim the session left: ${released.value}`,
    );
  }

  switch (verdict) {
    case 'tried':
      return ran;

    // Handed on again once the other claim ends. The session still counts
    // towards MAX_SESSIONS_PER_PR, which bounds what any verdict can spend.
    case 'taken':
      mut_memory.attempted.delete(next.key);

      world.log(
        `#${next.number}: someone else claimed it first; left to them.`,
      );

      return ran;

    // Before any session has run, the likeliest cause is the key itself, and
    // every look would meet it again.
    case 'not-started':
      return Result.err({
        fatal: !anySessionRan,
        message: `#${next.number}: the session failed before spending anything; its log above says why.`,
      });
  }
};

/**
 * Bounded by the queue as it stands, not by how long this has run: a key goes
 * once its pull request has closed or its head has moved, not when one survey
 * happens to read it differently.
 */
const forget = (
  mut_memory: RoundMemory,
  pullRequests: readonly RoundPullRequest[],
): void => {
  const prefixes = pullRequests.map(({ facts }) =>
    keyPrefix(facts.number, facts.headSha),
  );

  const open = new Set<number>(pullRequests.map(({ facts }) => facts.number));

  forgetAllBut(mut_memory.attempted, (key) =>
    prefixes.some((prefix) => key.startsWith(prefix)),
  );

  forgetAllBut(mut_memory.reported, (number) => open.has(number));

  forgetAllBut(mut_memory.sessions, (number) => open.has(number));
};

/** One survey, and at most one session. */
const runRound = async (
  skill: string,
  options: RunUnblockPrsSkillOptions,
  mut_memory: RoundMemory,
  anySessionRan: boolean,
  world: RunUnblockPrsSkillWorld,
): Promise<RoundResult> => {
  const queue = await world.readQueue();

  if (Result.isErr(queue)) {
    return Result.err({
      fatal: false,
      message: `cannot read the queue: ${queue.value}`,
    });
  }

  const survey = surveyQueue(queue.value, mut_memory.attempted);

  forget(mut_memory, queue.value);

  // Once per pull request while this runs; it files each only once anyway, so a
  // run that did not file them all is simply asked again next round.
  if (survey.unowned.some((number) => !mut_memory.reported.has(number))) {
    const reported = await world.reportUnowned(queue.value, options.dryRun);

    world.log(
      Arr.toUnshifted('report-unowned-prs:')(reported.lines).join(
        reported.lines.length > 1 ? '\n' : ' ',
      ),
    );

    if (reported.ok && !options.dryRun) {
      for (const number of survey.unowned) {
        mut_memory.reported.add(number);
      }
    }
  }

  const isCapped = ({ number }: Candidate): boolean =>
    (mut_memory.sessions.get(number) ?? 0) >= MAX_SESSIONS_PER_PR;

  const open = survey.fresh.filter((candidate) => !isCapped(candidate));

  const notes = [
    ...survey.claimed.map(
      (number) => `#${number}: someone holds a claim on it; left to them.`,
    ),
    ...survey.left.map(
      ({ number }) =>
        `#${number}: an earlier round left it as it stands; waiting for its head or its set-aside to move.`,
    ),
    ...survey.fresh
      .filter(isCapped)
      .map(
        ({ number }) =>
          `#${number}: ${MAX_SESSIONS_PER_PR} sessions have run on it since this started; not handed on again until this command restarts.`,
      ),
    ...(Arr.isNonEmpty(open) ? [] : ['Nothing for the skill.']),
  ].join('\n');

  const idle = Result.ok({ ran: false, notes } as const);

  if (!Arr.isNonEmpty(open)) {
    return idle;
  }

  const [next] = open;

  const claimant = world.newClaimant();

  const roundOf = (dir: string): readonly string[] =>
    claudeArgs({
      skill,
      number: next.number,
      claimant,
      workDir: dir,
      maxBudgetUsd: options.maxBudgetUsd,
      model: options.model,
    });

  if (options.dryRun) {
    world.log(
      `Would run, in ${world.root}: claude ${roundOf(world.sessionDirPattern).map(shellQuote).join(' ')}`,
    );

    return idle;
  }

  const workDir = await world.makeSessionDir();

  // After the last await before the session: a stop that came before it has no
  // session to be passed on to.
  if (world.stopRequested()) {
    await world.removeDir(workDir);

    return idle;
  }

  const { env, dropped } = sessionEnv(world.env);

  if (Arr.isNonEmpty(dropped)) {
    world.log(
      `Leaving ${dropped.join(', ')} out of the session's environment, so that it bills ANTHROPIC_API_KEY.`,
    );
  }

  world.log(
    `Starting ${skill} on #${next.number}, for at most $${options.maxBudgetUsd}.`,
  );

  // It resolves whatever happens, and nothing from here on throws: what a
  // session that may have spent leaves behind is always settled.
  const outcome = await world.runClaude(
    world.root,
    roundOf(workDir),
    env,
    (init) => checkInit(init, skill),
  );

  // A session that may have spent is not handed the same pull request again,
  // and counts towards MAX_SESSIONS_PER_PR whatever comes of it.
  if (outcome.kind === 'ran' && mayHaveSpent(outcome.result)) {
    mut_memory.attempted.add(next.key);

    mut_memory.sessions.set(
      next.number,
      (mut_memory.sessions.get(next.number) ?? 0) + 1,
    );
  }

  await world.removeDir(workDir);

  if (outcome.kind === 'refused') {
    // Stopped before its first event: the stop asked for, not a failure.
    if (world.stopRequested()) {
      return idle;
    }

    // What `checkInit` refuses is the configuration, and every round would meet
    // it again. A start that fails once sessions have run is more likely a
    // passing fault, and the next look tries again.
    return Result.err({
      fatal: outcome.cause === 'init' || !anySessionRan,
      message: outcome.message,
    });
  }

  world.log(`#${next.number}: ${describeOutcome(outcome)}`);

  const pruned = await world.pruneWorktrees();

  if (Result.isErr(pruned)) {
    world.log(`git worktree prune: ${pruned.value}`);
  }

  return settle(next, outcome, claimant, mut_memory, anySessionRan, world);
};
