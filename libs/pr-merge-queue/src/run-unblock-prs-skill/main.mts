import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { claimPr } from '../claim-pr/index.mjs';
import { git, log, repoRoot, sh, tokenFromEnv } from '../lib/index.mjs';
import { readQueueState } from '../pr-report/index.mjs';
import { reportUnownedPrs } from '../report-unowned-prs/index.mjs';
import {
  installStopHandlers,
  pause,
  stopRequested,
  WORKTREE_ROOT,
} from '../unblock-prs/index.mjs';
import {
  claudeArgs,
  runClaude,
  sessionEnv,
  type RanOutcome,
} from './claude.mjs';
import type { Options } from './options.mjs';
import { keyPrefix, surveyQueue, type Candidate } from './survey.mjs';
import { judgeSession, mayHaveSpent } from './verdict.mjs';

/**
 * Runs the `unblock-prs` skill beside the worker the way `/loop` does in a
 * session, but on the Claude API and without a person: each round surveys
 * the queue with the commands' own reading of it (`surveyQueue`), and starts
 * `claude -p` on the skill only when a pull request is the skill's to fix.
 * A round that finds nothing costs GitHub requests and no tokens.
 *
 * ```sh
 * run-unblock-prs-skill --max-budget-usd 5            # until Ctrl+C
 * run-unblock-prs-skill --max-budget-usd 5 --once     # one round
 * run-unblock-prs-skill --max-budget-usd 5 --dry-run  # say what it would run
 * ```
 *
 * **One pull request per round**, so that the budget is per pull request
 * and what a round was handed is exactly what it tried: a round that runs
 * out on the first of two would otherwise leave the second marked as tried.
 * After a round that ran, the next starts at once on the queue as read after
 * the session; after one that found nothing, it waits `--interval-min`.
 *
 * What the session may do is `claude.mts`'s; what it is told besides the
 * skill is `roundInstructions` there. A pull request nobody owns is filed by
 * `report-unowned-prs` from here, which needs no model. It stops for good
 * when Claude Code cannot be run as asked — not on the API key, no such
 * skill, no `claude` — since every later round would meet the same; a start
 * that fails after sessions have run is taken as a passing fault instead.
 */
export const runUnblockPrsSkill = async (
  options: Options,
): Promise<Result<undefined, string>> => {
  if (!options.dryRun && (process.env['ANTHROPIC_API_KEY'] ?? '') === '') {
    return Result.err(
      'ANTHROPIC_API_KEY is not set. This command runs the skill on the Claude API and never on a subscription; with one, run the skill under /loop in a session instead.',
    );
  }

  // Without it no owner can be read, and every round would say so forever.
  if (tokenFromEnv() === undefined) {
    return Result.err(
      'GH_TOKEN or GITHUB_TOKEN is not set: the queue is read, and the skill claims and pushes, as the account unblock-prs runs as.',
    );
  }

  const root = await repoRoot();

  const skill = options.skill ?? (await defaultSkill(root));

  installStopHandlers();

  // What a restart forgets: `Candidate` keys a session has had its try at,
  // and the pull requests nobody owns handed to `report-unowned-prs` already.
  const mut_attempted = new Set<string>();

  const mut_reported = new Set<number>();

  // Sessions run on each pull request, against MAX_SESSIONS_PER_PR.
  const mut_sessions = new Map<number, number>();

  // What the last round said it is waiting on.
  let mut_lastNotes = '';

  let mut_anySessionRan = false;

  while (!stopRequested()) {
    // A throw (a full temporary directory, say) is one failed round, not the
    // end of a command meant to be left running.
    const round: RoundResult = await runRound(
      root,
      skill,
      options,
      mut_attempted,
      mut_reported,
      mut_sessions,
      mut_anySessionRan,
    ).catch((error: unknown) =>
      Result.err({ fatal: false, message: unknownToString(error) } as const),
    );

    mut_anySessionRan ||= Result.isOk(round) && round.value.ran;

    // What was said before a session is said again after it.
    if (Result.isOk(round) && round.value.ran) {
      mut_lastNotes = '';
    }

    // What a round that waits is waiting on, said again only when it
    // changes: the log is read afterwards, for what the sessions did, not
    // for the same wait every ten minutes. A round that ran says nothing of
    // it, since the queue it surveyed is a session old; the next round,
    // started at once, says it fresh.
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
 * `ran` when a session ran, so that the next round starts at once; `notes`,
 * what the survey found it has to wait on.
 */
type RoundResult = Result<
  Readonly<{ ran: boolean; notes: string }>,
  RoundError
>;

type RoundError = Readonly<{ fatal: boolean; message: string }>;

/**
 * Three. A key stops a pull request from being paid for twice as it stands,
 * but a fix that is pushed and fails again stands differently each time,
 * and nobody is watching the loop that makes: after this many sessions on
 * one pull request, it waits for a person, or for this command to restart.
 */
const MAX_SESSIONS_PER_PR = 3;

/**
 * The skill as this repository links it (`.claude/skills/unblock-prs`), or
 * else as the plugin installs it. `checkInit` says which the session has when
 * this guesses wrong.
 */
const defaultSkill = async (root: string): Promise<string> => {
  const linked = await Result.fromPromise(
    fs.access(path.join(root, '.claude/skills/unblock-prs/SKILL.md')),
  );

  return Result.isOk(linked) ? 'unblock-prs' : 'pr-merge-queue:unblock-prs';
};

const describeOutcome = (outcome: RanOutcome): string => {
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
    `The round ${how}`,
    Arr.isNonEmpty(spent) ? ` (${spent.join(', ')})` : '',
    '.',
    sessionId === undefined
      ? ''
      : ` \`claude --resume ${sessionId}\` reopens it.`,
  ].join('');
};

/** Removes `dir`, or says why it could not: worth a line, not the round. */
const removeDir = async (dir: string): Promise<void> => {
  await fs.rm(dir, { recursive: true, force: true }).catch((error: unknown) => {
    log(`cannot remove ${dir}: ${unknownToString(error)}`);
  });
};

/** Drops from `mut_items`, a set or a map, the keys `keep` does not keep. */
const forgetAllBut = <A,>(
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

/** One survey, and at most one session. */
const runRound = async (
  root: string,
  skill: string,
  options: Options,
  mut_attempted: Set<string>,
  mut_reported: Set<number>,
  mut_sessions: Map<number, number>,
  anySessionRan: boolean,
): Promise<RoundResult> => {
  const state = await readQueueState();

  if (Result.isErr(state)) {
    return Result.err({
      fatal: false,
      message: `cannot read the queue: ${state.value}`,
    });
  }

  const survey = surveyQueue(state.value, mut_attempted);

  // Bounded by the queue as it stands, not by how long this has run: a key
  // goes once its pull request has closed or its head has moved, not when
  // one survey happens to read it differently.
  const prefixes = state.value.decided.entries.map(({ number, headSha }) =>
    keyPrefix(number, headSha),
  );

  const openNumbers = new Set<number>(
    state.value.decided.entries.map(({ number }) => number),
  );

  forgetAllBut(mut_attempted, (key) =>
    prefixes.some((prefix) => key.startsWith(prefix)),
  );

  forgetAllBut(mut_reported, (number) => openNumbers.has(number));

  forgetAllBut(mut_sessions, (number) => openNumbers.has(number));

  // Once per pull request while this runs; it files each only once anyway.
  if (survey.unowned.some((number) => !mut_reported.has(number))) {
    const reported = await reportUnownedPrs(options.dryRun, state.value);

    log(
      Result.isOk(reported)
        ? reported.value
        : `report-unowned-prs: ${reported.value}`,
    );

    // It reports a filing that failed in its text rather than as an error,
    // one line per pull request; that one is tried again next time.
    if (Result.isOk(reported) && !options.dryRun) {
      for (const number of survey.unowned) {
        if (!reported.value.includes(`#${number}: could not file`)) {
          mut_reported.add(number);
        }
      }
    }
  }

  const isCapped = ({ number }: Candidate): boolean =>
    (mut_sessions.get(number) ?? 0) >= MAX_SESSIONS_PER_PR;

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

  const ran = Result.ok({ ran: true, notes } as const);

  const [next] = open;

  const claimant = `run-unblock-prs-skill-${randomUUID().slice(0, 8)}` as const;

  const placeholder = path.join(WORKTREE_ROOT, 'run-unblock-prs-skill-XXXXXX');

  if (options.dryRun) {
    const wouldRun = claudeArgs({
      skill,
      number: next.number,
      claimant,
      workDir: placeholder,
      maxBudgetUsd: options.maxBudgetUsd,
      model: options.model,
    });

    log(`Would run, in ${root}: claude ${wouldRun.map(sh).join(' ')}`);

    return idle;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path of the worker's
  await fs.mkdir(WORKTREE_ROOT, { recursive: true });

  const workDir = await fs.mkdtemp(
    path.join(WORKTREE_ROOT, 'run-unblock-prs-skill-'),
  );

  // After the last await before the session: a stop that came before it has
  // no session to be passed on to.
  if (stopRequested()) {
    await removeDir(workDir);

    return idle;
  }

  const args = claudeArgs({
    skill,
    number: next.number,
    claimant,
    workDir,
    maxBudgetUsd: options.maxBudgetUsd,
    model: options.model,
  });

  const { env, dropped } = sessionEnv(process.env);

  if (Arr.isNonEmpty(dropped)) {
    log(
      `Leaving ${dropped.join(', ')} out of the session's environment, so that it bills ANTHROPIC_API_KEY.`,
    );
  }

  log(
    `Starting ${skill} on #${next.number}, for at most $${options.maxBudgetUsd}.`,
  );

  // It resolves whatever happens, and nothing from here on throws: what a
  // session that may have spent leaves behind is always settled.
  const outcome = await runClaude(root, args, env, skill);

  // A session that may have spent is not handed the same pull request
  // again, and counts towards MAX_SESSIONS_PER_PR whatever comes of it.
  if (outcome.kind === 'ran' && mayHaveSpent(outcome.result)) {
    mut_attempted.add(next.key);

    mut_sessions.set(next.number, (mut_sessions.get(next.number) ?? 0) + 1);
  }

  await removeDir(workDir);

  if (outcome.kind === 'refused') {
    // Stopped before its first event: the stop asked for, not a failure.
    if (stopRequested()) {
      return idle;
    }

    // What `checkInit` refuses is the configuration, and every round would
    // meet it again. A start that fails once sessions have run is more
    // likely a passing fault, and the next look tries again.
    return Result.err({
      fatal: outcome.cause === 'init' || !anySessionRan,
      message: outcome.message,
    });
  }

  log(`#${next.number}: ${describeOutcome(outcome)}`);

  // The worktrees went with the directory; this drops git's records of them.
  const pruned = await git('git worktree prune', root);

  if (Result.isErr(pruned)) {
    log(`git worktree prune: ${pruned.value}`);
  }

  const after = await readQueueState().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  const { verdict, releaseClaim } = judgeSession(
    outcome.result,
    Result.isOk(after) ? after.value.queue.get(next.number)?.claim : undefined,
    claimant,
  );

  // Unread, the claim may be standing: `claim-pr` reads it again itself, and
  // gives up only one of this claimant's.
  if (releaseClaim || Result.isErr(after)) {
    const released = await claimPr({
      number: next.number,
      by: claimant,
      release: true,
    }).catch((error: unknown) => Result.err(unknownToString(error)));

    log(
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
      mut_attempted.delete(next.key);

      log(`#${next.number}: someone else claimed it first; left to them.`);

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
