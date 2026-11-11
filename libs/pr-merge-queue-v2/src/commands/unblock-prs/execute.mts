// cspell:ignore unlabel

/**
 * Executing the one step a cycle planned (`spec/worker.md`, "Execute one
 * step"), and remembering what the attempt did: a failure GitHub may have
 * caused is counted ("Conditions"), a failure of the pull request's own sets it
 * aside, and a branch that moved under it is read again.
 */

import {
  attemptCondition,
  hasLabel,
  labelNames,
  layerHold,
  layersAbove,
  nextPickStep,
  PullRequestLabel,
  readCommitTree,
  readPullRequestNow,
  rerunFailedJobs,
  workflowRunOf,
  type AttemptedKind,
  type CyclePlan,
  type LayerHold,
  type NextRead,
  type PickStep,
  type PullRequestDecision,
  type PullRequestFacts,
  type SetAsideDecision,
  type WorkerMemory,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { RegenerateConfig } from '../../config/index.mjs';
import {
  restackLines,
  type AutoFixOutcome,
  type RestackLayer,
  type RestackOutcome,
  type TipRebaseOutcome,
} from '../../git/index.mjs';
import {
  addLabel,
  enableAutoMerge,
  messageOf,
  mutatePullRequest,
  removeLabel,
} from '../../github/index.mjs';
import type { SettleWorld } from './settle.mjs';

/** What executing the step did. */
export type Executed = Readonly<{
  memory: WorkerMemory;
  /** When to read again; `stale` is in a moment ({@link STALE_WAIT_MS}). */
  next: Wait;
  /** Pull requests set aside for their own failure while executing. */
  setAsides: readonly SetAsideDecision[];
}>;

export type Wait = NextRead | 'stale';

export type ExecuteWorld = SettleWorld &
  Readonly<{
    defaultBranch: string;
    nowEpochMs: number;
    git: WorkerGit;
    /** What Regenerate runs, when it is on. */
    regenerate: RegenerateConfig | undefined;
    /**
     * Auto-fix (`spec/worker.md`, "Auto-fix") on `pr`, whose `failed` contexts
     * failed: the head it pushed, or why it declined; an error is a fetch or
     * push GitHub may have caused.
     */
    autoFix: (
      pr: PullRequestFacts,
      failed: readonly string[],
    ) => Promise<Result<AutoFixOutcome, string>>;
  }>;

export type WorkerGit = Readonly<{
  rebaseOnTip: (
    pr: Readonly<{
      number: number;
      branch: string;
      head: string;
      base: string;
      parent: Readonly<{ head: string; mergeCommit: string }> | undefined;
      /**
       * Regenerate (`spec/worker.md`, "Regenerate"): what resolves a conflict
       * only in generated files, for a queued pull request under `--auto-fix`.
       */
      regenerate: RegenerateConfig | undefined;
    }>,
  ) => Promise<Result<TipRebaseOutcome, string>>;
  restack: (
    moved: Readonly<{ branch: string; from: string; to: string }>,
    layers: readonly RestackLayer[],
  ) => Promise<readonly RestackOutcome[]>;
}>;

/** How long to wait before reading again after GitHub's state was stale. */
export const STALE_WAIT_MS = 30_000;

export const executeStep = async (
  plan: CyclePlan,
  world: ExecuteWorld,
): Promise<Executed> => {
  const { step, memory } = plan;

  const decisionOf = (number: number): PullRequestDecision | undefined =>
    plan.decision.pullRequests.find(({ facts }) => facts.number === number);

  const idle: Executed = { memory, next: plan.next, setAsides: [] } as const;

  switch (step.kind) {
    case 'sleep':
      return idle;

    case 'watch':
      world.log(`#${step.number}: in flight; watching.`);

      return idle;

    case 'watch-ended':
      world.log(`#${step.number}: its watch ended: ${step.why}.`);

      return { ...idle, next: 'at-once' };

    case 'yield':
    case 'pause': {
      world.log(
        step.kind === 'yield'
          ? `#${step.number}: released beside one first in the order; putting \`skip-ci\` back on.`
          : `#${step.number}: ${step.why}.`,
      );

      await labelled(world, step.number, 'add');

      return { ...idle, next: 'at-once' };
    }

    case 'refire': {
      world.log(
        `#${step.number}: GitHub started no check for a required context; \`skip-ci\` on and off once.`,
      );

      if ((await labelled(world, step.number, 'add')) === 'done') {
        await labelled(world, step.number, 'remove');
      }

      return { ...idle, next: 'at-once' };
    }

    case 'rerun':
      return rerun(step, decisionOf(step.number), plan, world);

    case 'auto-fix':
      return autoFix(step, decisionOf(step.number), plan, world);

    case 'pick':
      return pick(step.picks, plan, world, decisionOf);

    case 'keep-on-tip':
      return keepOnTip(step.numbers, plan, world, decisionOf);

    case 'wait-for-layer':
      world.log(`#${step.number}: ${step.why}.`);

      return idle;
  }
};

/**
 * Carries `layers`, each after the one it is on, along after `moved`: one
 * claimed, or whose claim is unread, is left, and so is what is on it, since a
 * restack ends a claim (`layerHold`). The worker after its own push, and after
 * GitHub moved a pull request off a merged parent.
 */
export const carryLayersAlong = async (
  world: Readonly<{
    log: (line: string) => void;
    git: Readonly<{ restack: ExecuteWorld['git']['restack'] }>;
  }>,
  moved: Readonly<{ branch: string; from: string; to: string }>,
  layers: readonly Readonly<{ layer: RestackLayer; hold: LayerHold }>[],
): Promise<void> => {
  // Each layer comes after the one it is on, so a held one's branch is known to
  // be left before any layer on it is reached. `restack` would leave those too,
  // but as layers whose base "did not move"; the reason is the claim below,
  // which only this list knows.
  const mut_left = new Set<string>();

  const free = Arr.generate(function* () {
    for (const { layer, hold } of layers) {
      const why =
        hold.kind !== 'free'
          ? 'claimed, or its claim unread'
          : mut_left.has(layer.baseRef)
            ? (`the layer it is on, ${layer.baseRef}, is left` as const)
            : undefined;

      if (why === undefined) {
        yield layer;
      } else {
        mut_left.add(layer.headRef);

        world.log(`#${layer.number}: not restacked — ${why}.`);
      }
    }
  });

  if (!Arr.isNonEmpty(free)) {
    return;
  }

  const outcomes = await world.git.restack(moved, free);

  for (const line of restackLines(outcomes)) {
    world.log(line);
  }
};

/**
 * Before a pull request its green layer let go is released, whether its head
 * has the layer's tree (`spec/worker.md`, "Checking ahead", **new in v2**):
 * then the gate reuses the layer's verdict; otherwise its checks run in full,
 * which is said, not prevented.
 */
const compareWithLayer = async (
  memory: WorkerMemory,
  number: number,
  head: string,
  world: ExecuteWorld,
): Promise<void> => {
  const { releasing } = memory;

  if (releasing?.number !== number) {
    return;
  }

  const tree = await readCommitTree(world.context, head);

  world.log(
    Result.isErr(tree)
      ? `#${number}: cannot read its tree to compare with its layer's: ${messageOf(tree.value)}.`
      : tree.value === releasing.tree
        ? `#${number}: its head has its layer's tree; the gate reuses the layer's verdict.`
        : `#${number}: its head's tree is not its layer's; its checks run in full.`,
  );
};

/** Carries the layers stacked on `decision`'s branch onto its new head. */
const carryLayers = async (
  plan: CyclePlan,
  decision: PullRequestDecision,
  to: string,
  world: ExecuteWorld,
): Promise<void> =>
  carryLayersAlong(
    world,
    { branch: decision.facts.headRef, from: decision.facts.headSha, to },
    layersAbove(plan.decision.pullRequests, decision.facts.number).map(
      ({ facts, comments }) => ({ layer: facts, hold: layerHold(comments) }),
    ),
  );

/**
 * The memory once the worker itself moved `number` to `head`: the one in flight
 * and a demotion follow the push, which is not someone else's.
 */
const movedHead = (
  memory: WorkerMemory,
  number: number,
  head: string,
): WorkerMemory =>
  ({
    ...memory,
    inFlight:
      memory.inFlight?.number === number
        ? ({ ...memory.inFlight, head } as const)
        : memory.inFlight,
    demoted: memory.demoted.map((entry) =>
      entry.number === number ? { number, head } : entry,
    ),
  }) as const;

/** `memory` with the attempt of `kind` counted, the failure logged. */
const counted = <A,>(
  memory: WorkerMemory,
  key: Readonly<{ number: number; head: string }>,
  kind: AttemptedKind,
  attempt: Result<A, string>,
  world: ExecuteWorld,
): WorkerMemory => {
  if (Result.isErr(attempt)) {
    world.log(`#${key.number}: ${attempt.value}`);
  }

  return {
    ...memory,
    conditions: attemptCondition(
      memory.conditions,
      { ...key, kind },
      Result.isErr(attempt),
      world.nowEpochMs,
    ),
  };
};

/**
 * Rebases `decision`'s pull request onto the tip (or `--onto` a merged parent's
 * squash commit), pushes it leased, and carries the layers above.
 */
const rebase = async (
  decision: PullRequestDecision,
  parent: Readonly<{ head: string; mergeCommit: string }> | undefined,
  plan: CyclePlan,
  memory: WorkerMemory,
  world: ExecuteWorld,
): Promise<PickDone | 'unchanged'> => {
  const { facts } = decision;

  const { number, headSha: head } = facts;

  world.log(
    `#${number}: ${world.dryRun ? 'would rebase' : 'rebasing'} it onto ${parent === undefined ? world.defaultBranch : `${parent.mergeCommit.slice(0, 10)}, its merged parent's squash commit`}.`,
  );

  if (world.dryRun) {
    return { memory, next: 'active', setAsides: [] };
  }

  const rebased = await world.git.rebaseOnTip({
    number,
    branch: facts.headRef,
    head,
    base: world.defaultBranch,
    parent,
    // An `auto-rebase` pull request kept on the tip is not queued, and the
    // generators would run its branch's own code.
    regenerate: hasLabel(labelNames(facts.labels), PullRequestLabel.mergeQueued)
      ? world.regenerate
      : undefined,
  });

  const attempted = counted(
    memory,
    { number, head },
    'push-failed',
    rebased,
    world,
  );

  if (Result.isErr(rebased)) {
    return { memory: attempted, next: 'active', setAsides: [] };
  }

  const outcome = rebased.value;

  switch (outcome.kind) {
    case 'unchanged':
      return 'unchanged';

    case 'moved':
      world.log(`#${number}: its branch moved under it; reading again.`);

      return { memory: attempted, next: 'at-once', setAsides: [] };

    case 'already-in-base':
      return {
        memory: attempted,
        next: 'next-candidate',
        setAsides: [
          {
            number,
            head,
            reason: 'already-in-base',
            detail: `every commit is already in ${world.defaultBranch}`,
          },
        ],
      };

    case 'conflict':
      return {
        memory: attempted,
        next: 'next-candidate',
        setAsides: [
          {
            number,
            head,
            reason: 'rebase-failed',
            detail: outcome.detail,
          },
        ],
      };

    case 'pushed': {
      world.log(
        `#${number}: pushed ${outcome.head.slice(0, 10)}${Arr.isNonEmpty(outcome.regenerated) ? `, regenerating ${outcome.regenerated.join(', ')}` : ''}.`,
      );

      await carryLayers(plan, decision, outcome.head, world);

      return {
        memory: {
          ...movedHead(attempted, number, outcome.head),
          actedOn: Arr.uniq(Arr.toPushed(attempted.actedOn, number)),
        },
        next: 'at-once',
        setAsides: [],
      };
    }
  }
};

const logged = <A,>(
  memory: WorkerMemory,
  number: number,
  attempt: Result<A, string>,
  world: ExecuteWorld,
): WorkerMemory => {
  if (Result.isErr(attempt)) {
    world.log(`#${number}: ${attempt.value}`);
  }

  return memory;
};

const pickOne = async (
  step: PickStep,
  decision: PullRequestDecision,
  plan: CyclePlan,
  memory: WorkerMemory,
  world: ExecuteWorld,
): Promise<PickDone> => {
  const { number, head } = step;

  switch (step.kind) {
    case 'rebase': {
      const rebased = await rebase(
        decision,
        step.onto === undefined
          ? undefined
          : { head: step.onto.headSha, mergeCommit: step.onto.mergeCommitSha },
        plan,
        memory,
        world,
      );

      return rebased === 'unchanged'
        ? pickOne(
            nextPickStep(decision, world.defaultBranch, true),
            decision,
            plan,
            memory,
            world,
          )
        : rebased;
    }

    case 'stale':
      world.log(
        `#${number}: nothing to do; GitHub's state was stale. Reading again in ${STALE_WAIT_MS / 1000} seconds.`,
      );

      return { memory, next: 'stale', setAsides: [] };

    case 'arm':
    case 'disarm':
    case 'release':
      break;
  }

  const verb =
    step.kind === 'arm'
      ? 'arming auto-merge'
      : step.kind === 'disarm'
        ? 'disarming auto-merge, since only a ruleset bypass merges it'
        : 'taking `skip-ci` off';

  world.log(`#${number}: ${world.dryRun ? `would be ${verb}` : verb}.`);

  if (world.dryRun) {
    return { memory, next: 'active', setAsides: [] };
  }

  const now = await readPullRequestNow(world.context, number);

  if (Result.isErr(now)) {
    world.log(`#${number}: ${messageOf(now.value)}; reading again.`);

    return { memory, next: 'active', setAsides: [] };
  }

  const queued = hasLabel(now.value.labels, PullRequestLabel.mergeQueued);

  if (
    !queued ||
    !now.value.open ||
    now.value.headSha !== head ||
    (step.kind !== 'disarm' && now.value.baseRef !== world.defaultBranch) ||
    (step.kind === 'release' &&
      !hasLabel(now.value.labels, PullRequestLabel.skipCi))
  ) {
    world.log(`#${number}: it changed since it was read; reading again.`);

    return { memory, next: 'at-once', setAsides: [] };
  }

  if (step.kind === 'release') {
    await compareWithLayer(memory, number, head, world);

    const removed = await removeLabel(
      world.context,
      number,
      PullRequestLabel.skipCi,
    );

    const attempted = counted(
      memory,
      { number, head },
      'unlabel-failed',
      removed,
      world,
    );

    return Result.isErr(removed)
      ? { memory: attempted, next: 'active', setAsides: [] }
      : {
          memory: {
            ...attempted,
            inFlight: {
              number,
              head,
              releasedEpochMs: world.nowEpochMs,
              greenCount: 0,
              autoFixed: false,
            },
            release: {
              number,
              decidedEpochMs: world.nowEpochMs,
              order: plan.decision.candidates,
              paused: plan.decision.pullRequests
                .filter(({ facts: other }) =>
                  hasLabel(
                    other.labels.map(({ name }) => name),
                    PullRequestLabel.skipCi,
                  ),
                )
                .map(({ facts: other }) => other.number),
            },
            actedOn: Arr.uniq(Arr.toPushed(attempted.actedOn, number)),
          },
          next: 'at-once',
          setAsides: [],
        };
  }

  const mutated =
    step.kind === 'arm'
      ? await enableAutoMerge(world.context, now.value.nodeId)
      : await mutatePullRequest(
          world.context,
          'disablePullRequestAutoMerge',
          now.value.nodeId,
        );

  const armMessage = Result.mapErr(mutated, messageOf);

  return {
    memory:
      step.kind === 'arm'
        ? counted(memory, { number, head }, 'arm-failed', armMessage, world)
        : logged(memory, number, armMessage, world),
    next: Result.isErr(mutated) ? 'active' : 'at-once',
    setAsides: [],
  };
};

/**
 * Tries each candidate's step in order. One set aside for its own failure hands
 * the turn to the next on the same snapshot; anything else ends the cycle.
 */
const pick = async (
  picks: readonly PickStep[],
  plan: CyclePlan,
  world: ExecuteWorld,
  decisionOf: (number: number) => PullRequestDecision | undefined,
): Promise<Executed> => {
  const mut_setAsides: SetAsideDecision[] = [];

  let mut_memory = plan.memory;

  for (const step of picks) {
    const decision = decisionOf(step.number);

    if (decision === undefined) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop -- one at a time, by design
    const done = await pickOne(step, decision, plan, mut_memory, world);

    mut_memory = done.memory;

    mut_setAsides.push(...done.setAsides);

    if (done.next !== 'next-candidate') {
      return { memory: done.memory, next: done.next, setAsides: mut_setAsides };
    }
  }

  return { memory: mut_memory, next: 'active', setAsides: mut_setAsides };
};

type PickDone = Readonly<{
  memory: WorkerMemory;
  next: Wait | 'next-candidate';
  setAsides: readonly SetAsideDecision[];
}>;

/**
 * "Keeping on the tip": the first that rebases cleanly is pushed; one that
 * conflicts is set aside and the next tried.
 */
const keepOnTip = async (
  numbers: readonly number[],
  plan: CyclePlan,
  world: ExecuteWorld,
  decisionOf: (number: number) => PullRequestDecision | undefined,
): Promise<Executed> => {
  const mut_setAsides: SetAsideDecision[] = [];

  let mut_memory = plan.memory;

  for (const number of numbers) {
    const decision = decisionOf(number);

    if (decision === undefined) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop -- one at a time, by design
    const done = await rebase(decision, undefined, plan, mut_memory, world);

    if (done === 'unchanged') {
      continue;
    }

    mut_memory = done.memory;

    mut_setAsides.push(...done.setAsides);

    if (done.next !== 'next-candidate') {
      return { memory: done.memory, next: done.next, setAsides: mut_setAsides };
    }
  }

  return { memory: mut_memory, next: 'active', setAsides: mut_setAsides };
};

const rerun = async (
  step: Readonly<{ number: number; head: string; context: string }>,
  decision: PullRequestDecision | undefined,
  plan: CyclePlan,
  world: ExecuteWorld,
): Promise<Executed> => {
  const { number, head } = step;

  const checks = decision?.facts.checks;

  const runId =
    checks === undefined || Result.isErr(checks)
      ? undefined
      : workflowRunOf(checks.value, step.context);

  world.log(
    `#${number}: approved since its code-owner check \`${step.context}\` failed; ${world.dryRun ? 'would re-run' : 're-running'} that check's failed jobs.`,
  );

  if (world.dryRun) {
    return { memory: plan.memory, next: 'poll', setAsides: [] };
  }

  const asked: Result<undefined, string> =
    runId === undefined
      ? Result.err(`no workflow run of \`${step.context}\` was read`)
      : Result.mapErr(await rerunFailedJobs(world.context, runId), messageOf);

  return {
    memory: counted(
      plan.memory,
      { number, head },
      'rerun-failed',
      asked,
      world,
    ),
    next: 'poll',
    setAsides: [],
  };
};

const autoFix = async (
  step: Readonly<{ number: number; head: string; failed: readonly string[] }>,
  decision: PullRequestDecision | undefined,
  plan: CyclePlan,
  world: ExecuteWorld,
): Promise<Executed> => {
  if (decision === undefined) {
    return { memory: plan.memory, next: 'at-once', setAsides: [] };
  }

  const { number, head } = step;

  const failedNames = step.failed.map((name) => `\`${name}\``).join(', ');

  world.log(
    `#${number}: ${failedNames} failed; ${world.dryRun ? 'would try' : 'trying'} Auto-fix.`,
  );

  if (world.dryRun) {
    return { memory: plan.memory, next: 'active', setAsides: [] };
  }

  const attempt = await world.autoFix(decision.facts, step.failed);

  if (Result.isErr(attempt)) {
    // GitHub's, maybe: counted like a push, and tried again next cycle.
    const memory = counted(
      plan.memory,
      { number, head },
      'push-failed',
      attempt,
      world,
    );

    return {
      memory: {
        ...memory,
        inFlight:
          memory.inFlight === undefined
            ? undefined
            : { ...memory.inFlight, autoFixed: false },
      },
      next: 'active',
      setAsides: [],
    };
  }

  const fixed = attempt.value;

  switch (fixed.kind) {
    case 'pushed':
      world.log(`#${number}: Auto-fix pushed ${fixed.head.slice(0, 10)}.`);

      await carryLayers(plan, decision, fixed.head, world);

      return {
        memory: movedHead(plan.memory, number, fixed.head),
        next: 'poll',
        setAsides: [],
      };

    case 'moved':
      world.log(`#${number}: its branch moved under Auto-fix; reading again.`);

      return { memory: plan.memory, next: 'at-once', setAsides: [] };

    case 'declined':
      return {
        memory: { ...plan.memory, inFlight: undefined },
        next: 'at-once',
        setAsides: [
          {
            number,
            head,
            reason: 'checks-failed',
            detail: `${failedNames} failed; Auto-fix declined: ${fixed.why}`,
          },
        ],
      };
  }
};

/** `skip-ci` put on or taken off `number`: `done`, or `failed` and logged. */
const labelled = async (
  world: ExecuteWorld,
  number: number,
  how: 'add' | 'remove',
): Promise<'done' | 'failed'> => {
  if (world.dryRun) {
    world.log(
      `#${number}: would ${how === 'add' ? 'put `skip-ci` on' : 'take `skip-ci` off'}.`,
    );

    return 'done';
  }

  const written: Result<unknown, string> =
    how === 'add'
      ? await addLabel(world.context, number, PullRequestLabel.skipCi)
      : await removeLabel(world.context, number, PullRequestLabel.skipCi);

  if (Result.isErr(written)) {
    world.log(`#${number}: ${written.value}`);

    return 'failed';
  }

  return 'done';
};
