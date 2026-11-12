/**
 * `unblock-prs`, the worker (`spec/worker.md`): read a snapshot, settle the
 * comments, restack the layers GitHub moved, plan, execute one step, remember,
 * and read again or sleep, until stopped.
 */

import {
  EMPTY_MEMORY,
  findStackParents,
  hasLabel,
  labelNames,
  layerHold,
  layersAbove,
  parseWorkerMemory,
  planCycle,
  PullRequestLabel,
  queueCommentsOf,
  serializeWorkerMemory,
  type LayerHold,
  type PullRequestDecision,
  type PullRequestFacts,
  type QueueDecision,
  type Read,
  type ReadContext,
  type RepoRef,
  type Snapshot,
  type SnapshotOptions,
  type WorkerMemory,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { Config } from '../../config/index.mjs';
import { planAutoFix } from '../../git/index.mjs';
import {
  messageOf,
  openSession,
  type SessionWorld,
} from '../../github/index.mjs';
import {
  carryLayersAlong,
  executeStep,
  STALE_WAIT_MS,
  type ExecuteWorld,
  type Wait,
  type WorkerGit,
} from './execute.mjs';
import { executeLayerWork, type LayerWorld } from './layers.mjs';
import type { UnblockPrsOptions } from './options.mjs';
import {
  announceSetAsides,
  settleComments,
  unannouncedOf,
  type SettleWorld,
} from './settle.mjs';

/** What the worker reads and changes the world through; a test passes fakes. */
export type UnblockPrsWorld = SessionWorld &
  Readonly<{
    nowEpochMs: () => number;
    sleep: (ms: number) => Promise<void>;
    log: (line: string) => void;
    /** Whether a stop was asked for: the current step finishes, then it exits. */
    stopRequested: () => boolean;
    readConfig: () => Promise<Result<Config | undefined, string>>;
    readSnapshot: (
      context: ReadContext,
      options: SnapshotOptions,
    ) => Promise<Read<Snapshot>>;
    /** The memory file of `repo` (`spec/worker.md`, "Memory"). */
    memory: Readonly<{
      read: (repo: RepoRef) => Promise<Result<string | undefined, string>>;
      write: (
        repo: RepoRef,
        text: string,
      ) => Promise<Result<undefined, string>>;
    }>;
    git: WorkerGit &
      Readonly<{
        branchTips: () => Promise<Read<ReadonlyMap<string, string>>>;
        conflictsWithTip: SettleWorld['conflictsWithTip'];
        buildLayers: LayerWorld['buildLayers'];
        deleteBranch: LayerWorld['deleteBranch'];
      }>;
    /** Auto-fix under the repository's configuration. */
    autoFix: (config: Config | undefined) => ExecuteWorld['autoFix'];
  }>;

/** Runs cycles until stopped, or one under `--once` or `--dry-run`. */
export const unblockPrs = async (
  options: UnblockPrsOptions,
  world: UnblockPrsWorld,
): Promise<Result<string, string>> => {
  const session = await openSession(options.repo, world);

  if (Result.isErr(session)) {
    return session;
  }

  const config = await world.readConfig();

  if (Result.isErr(config)) {
    return config;
  }

  const { repo } = session.value;

  let mut_memory = await loadMemory(repo, world);

  for (;;) {
    // eslint-disable-next-line no-await-in-loop -- one cycle at a time, by design
    const cycle = await runCycle(mut_memory, {
      ...session.value,
      config: config.value,
      options,
      world,
    });

    mut_memory = cycle.memory;

    if (!options.dryRun) {
      // eslint-disable-next-line no-await-in-loop
      const written = await world.memory.write(
        repo,
        serializeWorkerMemory(mut_memory),
      );

      if (Result.isErr(written)) {
        world.log(`The memory was not written: ${written.value}`);
      }
    }

    if (options.once || options.dryRun || world.stopRequested()) {
      return Result.ok(world.stopRequested() ? 'Stopped.' : 'One cycle run.');
    }

    const waitMs = waitMsOf(cycle.next, options);

    if (waitMs > 0) {
      // eslint-disable-next-line no-await-in-loop
      await world.sleep(waitMs);
    }

    if (world.stopRequested()) {
      return Result.ok('Stopped.');
    }
  }
};

/** One cycle on `memory`: the memory after it, and when to read again. */
export const runCycle = async (
  memory: WorkerMemory,
  run: CycleRun,
): Promise<Readonly<{ memory: WorkerMemory; next: Wait }>> => {
  const { world, options, context, defaultBranch } = run;

  const nowEpochMs = world.nowEpochMs();

  const read = await world.readSnapshot(context, {
    nowEpochMs,
    // The worker reads the issues its pull requests close, outside the list.
    issuesLimit: 1,
    mergedLimit: 1,
    mergedDays: 1,
    follow: Arr.uniq([
      ...(memory.inFlight === undefined ? [] : [memory.inFlight.number]),
      ...memory.actedOn,
    ]),
    readBranchTips: world.git.branchTips,
  });

  if (Result.isErr(read)) {
    world.log(`The snapshot could not be read: ${messageOf(read.value)}`);

    return { memory, next: 'active' };
  }

  const settleWorld: SettleWorld = {
    context,
    dryRun: options.dryRun,
    log: world.log,
    conflictsWithTip: world.git.conflictsWithTip,
  } as const;

  const snapshot = await settleComments(read.value, settleWorld);

  if (await restackMoved(snapshot, run, nowEpochMs)) {
    return { memory, next: 'at-once' };
  }

  const planned = planCycle({
    snapshot,
    memory,
    config: {
      autoFix: options.autoFix && run.config?.autoFix !== undefined,
      watchTimeoutMs: options.watchTimeoutMs,
      idleAfter: options.idleAfter,
      speculate: run.config?.speculate,
      fixable: (checks) =>
        options.autoFix &&
        Result.isOk(planAutoFix(checks, run.config?.autoFix, nowEpochMs)),
    },
    nowEpochMs,
  });

  if (Result.isErr(planned)) {
    world.log(`Nothing planned: ${messageOf(planned.value)}`);

    return { memory, next: 'active' };
  }

  const plan = planned.value;

  for (const line of reportLines(plan.decision)) {
    world.log(line);
  }

  if (plan.layers?.note !== undefined) {
    world.log(`Checking ahead: ${plan.layers.note}.`);
  }

  const { defaultBranchTip } = snapshot.repository;

  const announcedEarly = await announceSetAsides(
    [
      ...plan.memory.unannounced,
      ...plan.setAsides.map((each) => unannouncedOf(each, defaultBranchTip)),
    ],
    snapshot,
    settleWorld,
  );

  const layered =
    plan.layers === undefined
      ? 'go-on'
      : await executeLayerWork(
          plan.layers.work,
          (number) =>
            plan.decision.pullRequests.find(
              ({ facts }) => facts.number === number,
            ),
          {
            context,
            dryRun: options.dryRun,
            log: world.log,
            defaultBranch,
            buildLayers: world.git.buildLayers,
            deleteBranch: world.git.deleteBranch,
          },
        );

  const stepped =
    layered === 'fall-back'
      ? ({
          ...plan,
          step: plan.layers?.fallback ?? { kind: 'sleep' },
        } as const)
      : plan;

  const executed = await executeStep(stepped, {
    ...settleWorld,
    defaultBranch,
    nowEpochMs,
    git: world.git,
    regenerate: run.options.autoFix ? run.config?.regenerate : undefined,
    autoFix: world.autoFix(run.config),
  });

  const announcedLate = await announceSetAsides(
    executed.setAsides.map((each) => unannouncedOf(each, defaultBranchTip)),
    snapshot,
    settleWorld,
  );

  return {
    memory: {
      ...executed.memory,
      unannounced: [...announcedEarly, ...announcedLate],
      actedOn: executed.memory.actedOn.filter(
        (number) =>
          !Result.isOk(snapshot.pullRequests) ||
          snapshot.pullRequests.value.some((pr) => pr.number === number),
      ),
    },
    next: executed.next,
  };
};

export type CycleRun = Readonly<{
  context: ReadContext;
  repo: RepoRef;
  defaultBranch: string;
  config: Config | undefined;
  options: UnblockPrsOptions;
  world: UnblockPrsWorld;
}>;

/** How long to wait before the next cycle. */
export const waitMsOf = (next: Wait, options: UnblockPrsOptions): number => {
  switch (next) {
    case 'at-once':
      return 0;

    case 'stale':
      return STALE_WAIT_MS;

    case 'poll':
      return options.pollIntervalMs;

    case 'active':
      return options.activeIntervalMs;

    case 'idle':
      return options.idleIntervalMs;
  }
};

/** Every queued pull request's standing with its reason, one line each. */
export const reportLines = (decision: QueueDecision): readonly string[] =>
  decision.pullRequests
    .filter(({ standing }) => standing.kind !== 'ignore')
    .map((each) => `#${each.facts.number} ${standingText(each)}` as const);

/** The memory from its file, or an empty one, saying why. */
const loadMemory = async (
  repo: RepoRef,
  world: UnblockPrsWorld,
): Promise<WorkerMemory> => {
  const text = await world.memory.read(repo);

  if (Result.isErr(text)) {
    world.log(`The memory could not be read (${text.value}); starting empty.`);

    return EMPTY_MEMORY;
  }

  if (text.value === undefined) {
    return EMPTY_MEMORY;
  }

  const parsed = parseWorkerMemory(text.value);

  if (Result.isErr(parsed)) {
    world.log(`The memory does not parse (${parsed.value}); starting empty.`);

    return EMPTY_MEMORY;
  }

  return parsed.value;
};

/** {@link restackMoved} for one pull request: whether it was pushed. */
const restackOneMoved = async (
  pr: PullRequestFacts,
  run: CycleRun,
  stack: Readonly<{
    holdOf: (layer: PullRequestFacts) => LayerHold;
    above: readonly PullRequestFacts[];
  }>,
): Promise<boolean> => {
  const { world, defaultBranch } = run;

  const parent = Result.isOk(pr.mergedParent)
    ? pr.mergedParent.value
    : undefined;

  if (parent === undefined) {
    return false;
  }

  if (stack.holdOf(pr).kind !== 'free') {
    world.log(
      `#${pr.number}: GitHub moved it off #${parent.number}, which merged; not restacked — claimed, or its claim unread.`,
    );

    return false;
  }

  world.log(
    `#${pr.number}: GitHub moved it off #${parent.number}, which merged; ${run.options.dryRun ? 'would restack' : 'restacking'} it onto the squash commit.`,
  );

  if (run.options.dryRun) {
    return false;
  }

  const rebased = await world.git.rebaseOnTip({
    number: pr.number,
    branch: pr.headRef,
    head: pr.headSha,
    base: defaultBranch,
    parent: { head: parent.headSha, mergeCommit: parent.mergeCommitSha },
    regenerate: undefined,
  });

  if (Result.isErr(rebased) || rebased.value.kind !== 'pushed') {
    world.log(
      `#${pr.number}: not restacked — ${Result.isErr(rebased) ? rebased.value : rebased.value.kind}.`,
    );

    return false;
  }

  await carryLayersAlong(
    world,
    { branch: pr.headRef, from: pr.headSha, to: rebased.value.head },
    stack.above.map((layer) => ({ layer, hold: stack.holdOf(layer) })),
  );

  return true;
};

/**
 * "Restack layers GitHub moved": each open pull request onto the default
 * branch, not queued (the queue's own are rebased when picked), that GitHub
 * moved off a merged parent and still contains the head that parent merged at,
 * rebased `--onto` the parent's squash commit, with every layer above it. A
 * claimed one, or one whose claim is unread, is left, and so is a claimed layer
 * and what is on it, as every command that restacks leaves them. One at a time:
 * each rebase fetches and makes worktrees in the one clone. Whether any was
 * pushed: then the cycle reads again before planning.
 */
const restackMoved = async (
  snapshot: Snapshot,
  run: CycleRun,
  nowEpochMs: number,
): Promise<boolean> => {
  const { pullRequests } = snapshot;

  if (Result.isErr(pullRequests)) {
    return false;
  }

  const { defaultBranch } = run;

  const holdOf = (pr: PullRequestFacts): LayerHold =>
    layerHold(
      queueCommentsOf(pr, snapshot.repository.defaultBranchTip, nowEpochMs),
    );

  // The stack the decision reads too (its `stackedOn` is `findStackParents`'s),
  // walked by the same `layersAbove` as the worker's own restack. That rebuilds
  // the parents each time, over the open pull requests, a few dozen: one walker
  // shared is worth more than that.
  const parents = findStackParents(pullRequests.value, defaultBranch);

  const stacked = pullRequests.value.map((facts) => ({
    facts,
    stackedOn: parents.get(facts.number),
  }));

  const moved = pullRequests.value.filter(
    (pr) =>
      pr.baseRef === defaultBranch &&
      !pr.fromFork &&
      !hasLabel(labelNames(pr.labels), PullRequestLabel.mergeQueued) &&
      Result.isOk(pr.mergedParent) &&
      pr.mergedParent.value?.containsHead === true,
  );

  let mut_pushed = false;

  for (const pr of moved) {
    // eslint-disable-next-line no-await-in-loop -- one clone, one at a time
    const restacked = await restackOneMoved(pr, run, {
      holdOf,
      above: layersAbove(stacked, pr.number).map(({ facts }) => facts),
    });

    mut_pushed ||= restacked;
  }

  return mut_pushed;
};

const standingText = ({ standing }: PullRequestDecision): string => {
  switch (standing.kind) {
    case 'ignore':
    case 'candidate':
    case 'in-flight':
    case 'failing':
    case 'release-stale':
      return standing.kind;

    case 'unactionable':
    case 'held':
      return `${standing.kind}: ${standing.reason}`;

    case 'owned':
      return `owned by ${standing.owner.owner}: ${standing.owner.reason}`;

    case 'stacked':
      return `stacked on #${standing.on}${standing.cyclic ? ' (in a cycle)' : ''}`;

    case 'native-stack':
      return `in GitHub's stack ${standing.entry.stack}, merged by hand`;

    case 'waiting':
      return `waiting on ${standing.on.map((number) => `#${number}`).join(', ')}${standing.cyclic ? ' (in a cycle)' : ''}`;

    case 'release-blocked':
      return `release blocked by ${standing.by.map(({ number }) => `#${number}`).join(', ')}`;

    case 'merge-state':
      return `merge state ${standing.state}`;

    case 'unread':
      return `unread: ${messageOf(standing.error)}`;
  }
};
