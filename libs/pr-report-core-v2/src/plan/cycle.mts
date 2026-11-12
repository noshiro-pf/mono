// cspell:ignore unlabel
/**
 * One cycle's plan (`spec/worker.md`, "The cycle", step 4): from a snapshot and
 * the memory, the one step to take, the set-asides to write, and the memory
 * after this snapshot. Pure; the worker executes the step and remembers what
 * its attempts did.
 */

import { Arr, Result } from 'ts-data-forge';
import {
  hasLabel,
  isVersionBranch,
  PullRequestLabel,
} from '../conventions/index.mjs';
import {
  codeOwnerGate,
  codeOwnersEnforcedBy,
  decideQueue,
  labelNames,
  type PullRequestDecision,
  type QueueDecision,
  type SetAsideReason,
} from '../decide/index.mjs';
import type {
  HeadChecks,
  MergedParent,
  PullRequestFacts,
  Read,
  Snapshot,
} from '../snapshot/index.mjs';
import {
  conditionVerdict,
  markRefired,
  observeConditions,
  type ConditionKey,
} from './conditions.mjs';
import type { HeadOf, InFlight, WorkerMemory } from './memory.mjs';
import {
  planSpeculation,
  type LayerWork,
  type SpeculateConfig,
} from './speculate.mjs';
import {
  judgeWatch,
  watchConditionsMet,
  type CodeOwnerCheck,
  type WatchOutcome,
} from './watch.mjs';

/**
 * The plan for `snapshot`, or why there is none: the open pull requests unread
 * plan nothing.
 */
export const planCycle = ({
  snapshot,
  memory,
  config,
  nowEpochMs,
}: PlanInput): Read<CyclePlan> => {
  const { pullRequests } = snapshot;

  if (Result.isErr(pullRequests)) {
    return pullRequests;
  }

  const heads = new Map(
    pullRequests.value.map((pr) => [pr.number, pr.headSha] as const),
  );

  const atHead = <H extends HeadOf>(entry: H): boolean =>
    heads.get(entry.number) === entry.head;

  const demoted = memory.demoted.filter(atHead);

  const decided = decideQueue(snapshot, {
    nowEpochMs,
    demoted: new Set(demoted.map(({ number }) => number)),
  });

  if (Result.isErr(decided)) {
    return decided;
  }

  const decision = decided.value;

  const byNumber = new Map(
    decision.pullRequests.map((each) => [each.facts.number, each] as const),
  );

  const isWorkers = (number: number): boolean => {
    const owner = byNumber.get(number)?.owner;

    return (
      owner !== undefined &&
      Result.isOk(owner) &&
      owner.value?.owner === 'worker'
    );
  };

  const inFlight =
    memory.inFlight ?? adoptReleased(decision, isWorkers, nowEpochMs);

  const outOfSync = headsOutOfSync(snapshot, decision);

  const conditions = observeConditions(
    memory.conditions,
    [
      ...outOfSync,
      ...(inFlight === undefined
        ? []
        : watchConditionsMet(inFlight, byNumber.get(inFlight.number))),
    ],
    heads,
    nowEpochMs,
  );

  const settled = conditionSetAsides(
    conditions,
    nowEpochMs,
    isWorkers,
    inFlight?.number,
  );

  const fingerprint = fingerprintOf(snapshot, decision);

  const idleCount =
    fingerprint === memory.fingerprint ? memory.idleCount + 1 : 1;

  const base: WorkerMemory = {
    ...memory,
    conditions,
    demoted,
    unannounced: memory.unannounced.filter(atHead),
    codeOwnerReruns: memory.codeOwnerReruns.filter(atHead),
    // Read by "Yield" this cycle alone.
    release: undefined,
    fingerprint,
    idleCount,
    inFlight,
    // Released, its layer has done its part.
    releasing: inFlight === undefined ? memory.releasing : undefined,
  } as const;

  const done = (
    step: CycleStep,
    setAsides: readonly SetAsideDecision[],
    next: WorkerMemory,
    layers?: LayersPlan,
  ): CyclePlan =>
    ({
      step,
      setAsides: Arr.uniqBy([...settled, ...setAsides], ({ number }) => number),
      memory: next,
      decision,
      next: nextRead(step, idleCount, config.idleAfter),
      layers,
    }) as const;

  const yielded = yieldStep(memory, decision, isWorkers, byNumber);

  if (yielded !== undefined) {
    return Result.ok(
      done({ kind: 'yield', ...yielded }, [], {
        ...base,
        inFlight:
          base.inFlight?.number === yielded.number ? undefined : base.inFlight,
      }),
    );
  }

  if (inFlight !== undefined && !settled.some(isOf(inFlight.number))) {
    const outcome = judgeWatch(inFlight, {
      decision: byNumber.get(inFlight.number),
      followed: snapshot.followed,
      conditions,
      nowEpochMs,
      watchTimeoutMs: config.watchTimeoutMs,
      mainUnread: Result.isErr(snapshot.defaultBranchChecks),
      codeOwnerCheck: codeOwnerCheckOf(snapshot),
      autoFix: config.autoFix,
      reruns:
        base.codeOwnerReruns.find(
          (entry) =>
            entry.number === inFlight.number && entry.head === inFlight.head,
        )?.count ?? 0,
    });

    const watched = afterWatch(inFlight, outcome, base);

    if (watched !== undefined) {
      return Result.ok(done(watched.step, watched.setAsides, watched.memory));
    }
  }

  const setAsideNow = new Set(settled.map(({ number }) => number));

  const syncing = new Set(outOfSync.map(({ number }) => number));

  const pickable = decision.candidates.filter(
    (number) => !setAsideNow.has(number) && !syncing.has(number),
  );

  const releasing =
    base.releasing !== undefined && pickable.includes(base.releasing.number)
      ? base.releasing
      : undefined;

  const memoryAfter: WorkerMemory = {
    ...base,
    inFlight: undefined,
    releasing,
  } as const;

  const pickStepOf = (numbers: readonly number[]): CycleStep | undefined => {
    const picks = numbers
      .map((number) => byNumber.get(number))
      .filter((each) => each !== undefined)
      .map((each) =>
        nextPickStep(each, snapshot.repository.defaultBranch, false),
      );

    return Arr.isNonEmpty(picks) ? { kind: 'pick', picks } : undefined;
  };

  const withoutLayers = pickStepOf(pickable);

  // A green layer let it go: it is picked alone, the layers left as they are,
  // until it is in flight.
  if (releasing !== undefined) {
    return Result.ok(
      done(
        pickStepOf([releasing.number]) ?? { kind: 'sleep' },
        [],
        memoryAfter,
      ),
    );
  }

  const speculation =
    config.speculate === undefined
      ? undefined
      : planSpeculation({
          snapshot,
          candidates: pickable,
          stackedAbove: decision.stackedAbove,
          byNumber,
          config: config.speculate,
          demoted: new Set(demoted.map(({ number }) => number)),
          fixable: config.fixable,
          nowEpochMs,
        });

  if (speculation !== undefined && Arr.isNonEmpty(speculation.order)) {
    const [first] = speculation.order;

    const step =
      speculation.release === 'none'
        ? ({
            kind: 'wait-for-layer',
            number: first,
            head: byNumber.get(first)?.facts.headSha ?? '',
            why: speculation.note ?? '',
          } as const)
        : (pickStepOf(
            speculation.release === 'first' ? [first] : speculation.order,
          ) ?? { kind: 'sleep' });

    const layerTree =
      speculation.release === 'first'
        ? layerTreeOf(snapshot, first)
        : undefined;

    return Result.ok(
      done(
        step,
        speculation.setAside === undefined
          ? []
          : [{ ...speculation.setAside, reason: 'checks-failed' }],
        {
          ...memoryAfter,
          releasing:
            layerTree === undefined
              ? undefined
              : { ...layerTree, number: first },
        },
        {
          work: speculation.work,
          fallback: withoutLayers,
          note: speculation.note,
        },
      ),
    );
  }

  if (withoutLayers !== undefined) {
    return Result.ok(done(withoutLayers, [], memoryAfter));
  }

  const behind = keptOnTip(decision, snapshot, isWorkers).filter(
    (number) => !setAsideNow.has(number) && !syncing.has(number),
  );

  return Result.ok(
    done(
      Arr.isNonEmpty(behind)
        ? { kind: 'keep-on-tip', numbers: behind }
        : { kind: 'sleep' },
      [],
      memoryAfter,
      speculation === undefined
        ? undefined
        : { work: speculation.work, fallback: undefined, note: undefined },
    ),
  );
};

/**
 * What the worker remembers of a snapshot read, for "Intervals": the open pull
 * requests (head, merge state, labels, auto-merge, draft, body), the review
 * holds and the tip, hashed.
 */
export const fingerprintOf = (
  snapshot: Snapshot,
  decision: QueueDecision,
): string =>
  fnv1a(
    JSON.stringify([
      snapshot.repository.defaultBranchTip,
      decision.pullRequests.map(({ facts, standing }) => [
        facts.number,
        facts.headSha,
        facts.mergeState,
        labelNames(facts.labels),
        facts.autoMerge,
        facts.isDraft,
        facts.body,
        standing.kind === 'held' ? standing.reason : '',
      ]),
    ]),
  );

/**
 * The next step of a candidate. `rebased` is a rebase just tried that changed
 * nothing: GitHub's comparison was stale, and the step after it is next.
 */
export const nextPickStep = (
  decision: PullRequestDecision,
  defaultBranch: string,
  rebased: boolean,
): PickStep => {
  const { facts } = decision;

  const { number, headSha: head } = facts;

  const labels = labelNames(facts.labels);

  const parent = Result.isOk(facts.mergedParent)
    ? facts.mergedParent.value
    : undefined;

  const onto = parent?.containsHead === true ? parent : undefined;

  if (
    !rebased &&
    !isVersionBranch(facts.headRef, defaultBranch) &&
    needsRebase(facts)
  ) {
    return { kind: 'rebase', number, head, onto };
  }

  const bypass =
    decision.review !== undefined &&
    Result.isOk(decision.review) &&
    decision.review.value?.kind === 'bypass';

  return !bypass && !facts.autoMerge && facts.baseRef === defaultBranch
    ? { kind: 'arm', number, head }
    : bypass && facts.autoMerge
      ? { kind: 'disarm', number, head }
      : hasLabel(labels, PullRequestLabel.skipCi)
        ? { kind: 'release', number, head }
        : { kind: 'stale', number, head };
};

export type PlanInput = Readonly<{
  snapshot: Snapshot;
  memory: WorkerMemory;
  config: PlanConfig;
  nowEpochMs: number;
}>;

export type PlanConfig = Readonly<{
  /** Whether Auto-fix is configured and not turned off. */
  autoFix: boolean;
  /** `--watch-timeout`. */
  watchTimeoutMs: number;
  /** `--idle-after`. */
  idleAfter: number;
  /** `speculate` of the configuration; `undefined` checks nothing ahead. */
  speculate: SpeculateConfig | undefined;
  /** Whether Auto-fix would fix every failure on `checks`. */
  fixable: (checks: HeadChecks) => boolean;
}>;

export type CyclePlan = Readonly<{
  step: CycleStep;
  /**
   * Pull requests set aside this cycle, to be written as comments; each is left
   * alone this cycle whether or not its comment is written.
   */
  setAsides: readonly SetAsideDecision[];
  /** The memory after this snapshot, before the step is executed. */
  memory: WorkerMemory;
  /** What the plan was decided from, for the report. */
  decision: QueueDecision;
  /**
   * When to read again if the step changes nothing: `poll` while one is in
   * flight, `idle` once the snapshot has sat still, `active` otherwise.
   * A step that changes a branch, a label or auto-merge reads again at once.
   */
  next: NextRead;
  /**
   * Checking ahead, where it is configured and nothing is in flight: the work
   * on the layers, done before the step; the step as without layers, taken
   * instead when the work fails (a build, or a dispatch on the first layer);
   * and why the first candidate waits, or why nothing is checked ahead.
   */
  layers: LayersPlan | undefined;
}>;

export type LayersPlan = Readonly<{
  work: LayerWork;
  fallback: CycleStep | undefined;
  note: string | undefined;
}>;

export type NextRead = 'active' | 'at-once' | 'idle' | 'poll';

/**
 * - `yield` — put `skip-ci` back on the worker's own release.
 * - `pause` — put `skip-ci` back on the one in flight.
 * - `refire` — `skip-ci` on and off, once.
 * - `auto-fix` — run the fixers and push.
 * - `rerun` — re-run the failed jobs of the code-owner check.
 * - `watch` — wait for the one in flight.
 * - `watch-ended` — its watch ended; read again at once.
 * - `pick` — the candidates in order, each with its next step: the first is
 *   tried, and the next one only when the first is set aside for its own
 *   failure.
 * - `wait-for-layer` — the first candidate waits for its layer's checks.
 * - `keep-on-tip` — rebase the first that can be, one per cycle.
 * - `sleep` — nothing to do.
 */
export type CycleStep = Readonly<
  | (Readonly<{ kind: 'yield' }> & HeadOf)
  | (Readonly<{ kind: 'pause' } & { why: string }> & HeadOf)
  | (Readonly<{ kind: 'refire' }> & HeadOf)
  | (Readonly<{ kind: 'auto-fix' } & { failed: readonly string[] }> & HeadOf)
  | (Readonly<{ kind: 'rerun' } & { context: string }> & HeadOf)
  | (Readonly<{ kind: 'watch' }> & HeadOf)
  | (Readonly<{ kind: 'watch-ended' } & { why: string }> & HeadOf)
  | (Readonly<{ kind: 'wait-for-layer' } & { why: string }> & HeadOf)
  | { kind: 'pick'; picks: readonly PickStep[] }
  | { kind: 'keep-on-tip'; numbers: readonly number[] }
  | { kind: 'sleep' }
>;

/**
 * A candidate's next step while picking:
 *
 * - `rebase` — onto the tip, or `--onto` the squash commit of the parent
 *   `onto` names from the head it merged at;
 * - `arm` / `disarm` — auto-merge, which a bypass-only head has off;
 * - `release` — take `skip-ci` off;
 * - `stale` — nothing to do: GitHub's merge state was stale; read again in a
 *   moment.
 */
export type PickStep = HeadOf &
  Readonly<
    | { kind: 'rebase'; onto: MergedParent | undefined }
    | { kind: 'arm' }
    | { kind: 'disarm' }
    | { kind: 'release' }
    | { kind: 'stale' }
  >;

export type SetAsideDecision = HeadOf &
  Readonly<{
    reason: SetAsideReason;
    /** What the comment says after the reason. */
    detail: string;
  }>;

/** The watch's outcome as a step, set-asides and memory. */
const afterWatch = (
  inFlight: InFlight,
  outcome: WatchOutcome,
  memory: WorkerMemory,
):
  | Readonly<{
      step: CycleStep;
      setAsides: readonly SetAsideDecision[];
      memory: WorkerMemory;
    }>
  | undefined => {
  const { number, head } = inFlight;

  const stop = { ...memory, inFlight: undefined } as const;

  switch (outcome.kind) {
    case 'watching':
      return {
        step: { kind: 'watch', number, head },
        setAsides: [],
        memory: { ...memory, inFlight: outcome.watched },
      };

    case 'pause':
      return {
        step: { kind: 'pause', number, head, why: outcome.why },
        setAsides: [],
        memory: stop,
      };

    case 'refire':
      return {
        step: { kind: 'refire', number, head },
        setAsides: [],
        memory: {
          ...memory,
          inFlight: outcome.watched,
          conditions: markRefired(memory.conditions, {
            number,
            head,
            kind: 'checks-not-started',
          }),
        },
      };

    case 'auto-fix':
      return {
        step: { kind: 'auto-fix', number, head, failed: outcome.failed },
        setAsides: [],
        memory: { ...memory, inFlight: outcome.watched },
      };

    case 'rerun':
      return {
        step: { kind: 'rerun', number, head, context: outcome.context },
        setAsides: [],
        memory: {
          ...memory,
          inFlight: outcome.watched,
          codeOwnerReruns: Arr.toPushed(
            memory.codeOwnerReruns.filter(
              (entry) => entry.number !== number || entry.head !== head,
            ),
            {
              number,
              head,
              count:
                (memory.codeOwnerReruns.find(
                  (entry) => entry.number === number && entry.head === head,
                )?.count ?? 0) + 1,
            },
          ),
        },
      };

    case 'ended':
      return {
        step: { kind: 'watch-ended', number, head, why: outcome.why },
        setAsides: [],
        memory: stop,
      };

    case 'merged':
    case 'closed':
      return {
        step: {
          kind: 'watch-ended',
          number,
          head,
          why: `${outcome.kind} at ${outcome.at}`,
        },
        setAsides: [],
        memory: stop,
      };

    case 'set-aside':
      return {
        step: {
          kind: 'watch-ended',
          number,
          head,
          why: `set aside \`${outcome.reason}\``,
        },
        setAsides: [
          { number, head, reason: outcome.reason, detail: outcome.detail },
        ],
        memory: {
          ...stop,
          demoted:
            outcome.reason === 'not-merging'
              ? Arr.toPushed(
                  stop.demoted.filter((entry) => entry.number !== number),
                  { number, head },
                )
              : stop.demoted,
        },
      };
  }
};

const isReleased = (facts: PullRequestFacts): boolean => {
  const labels = labelNames(facts.labels);

  return (
    hasLabel(labels, PullRequestLabel.mergeQueued) &&
    !hasLabel(labels, PullRequestLabel.skipCi)
  );
};

/**
 * A pull request the worker owns that is released — `merge-queued` without
 * `skip-ci` — and up to date, when memory holds none: after a restart, or a
 * release made by someone else. The lowest number first.
 */
const adoptReleased = (
  decision: QueueDecision,
  isWorkers: (number: number) => boolean,
  nowEpochMs: number,
): InFlight | undefined => {
  const found = decision.pullRequests.find(
    ({ facts, standing }) =>
      isWorkers(facts.number) &&
      isReleased(facts) &&
      (standing.kind === 'in-flight' || standing.kind === 'failing'),
  );

  return found === undefined
    ? undefined
    : {
        number: found.facts.number,
        head: found.facts.headSha,
        releasedEpochMs: nowEpochMs,
        greenCount: 0,
        autoFixed: false,
      };
};

/** Where `number` stands in `order`; one not in it after every one that is. */
const rankIn = (order: readonly number[], number: number): number => {
  const index = order.indexOf(number);

  return index === -1 ? order.length : index;
};

/**
 * "Yield": the cycle after a release, when another pull request the worker owns
 * was released in the same moment and comes first in the order the release was
 * decided in, the worker's own goes back under `skip-ci`.
 */
const yieldStep = (
  memory: WorkerMemory,
  decision: QueueDecision,
  isWorkers: (number: number) => boolean,
  byNumber: ReadonlyMap<number, PullRequestDecision>,
): HeadOf | undefined => {
  const { release } = memory;

  if (release === undefined) {
    return undefined;
  }

  const own = byNumber.get(release.number);

  if (own === undefined || !isReleased(own.facts)) {
    return undefined;
  }

  const ownRank = rankIn(release.order, release.number);

  const ahead = decision.pullRequests.some(
    ({ facts }) =>
      facts.number !== release.number &&
      isWorkers(facts.number) &&
      isReleased(facts) &&
      release.paused.includes(facts.number) &&
      rankIn(release.order, facts.number) < ownRank,
  );

  return ahead
    ? { number: release.number, head: own.facts.headSha }
    : undefined;
};

/**
 * Whether the head lacks the tip, or a merged parent's squash commit is still
 * to replace that parent's commits. Unread, it is rebased: a rebase that
 * changes nothing is told by the push.
 */
const needsRebase = (facts: PullRequestFacts): boolean =>
  (Result.isOk(facts.mergedParent) &&
    facts.mergedParent.value?.containsHead === true) ||
  !Result.isOk(facts.comparison) ||
  facts.comparison.value.behindBy > 0;

/**
 * "Keeping on the tip": the pull requests that wait under `skip-ci`, the
 * worker's, behind the tip, lowest number first.
 */
const keptOnTip = (
  decision: QueueDecision,
  snapshot: Snapshot,
  isWorkers: (number: number) => boolean,
): readonly number[] => {
  const { defaultBranch } = snapshot.repository;

  return decision.pullRequests
    .filter(({ facts }) => {
      const labels = labelNames(facts.labels);

      return (
        hasLabel(labels, PullRequestLabel.skipCi) &&
        (hasLabel(labels, PullRequestLabel.autoRebase) ||
          hasLabel(labels, PullRequestLabel.mergeQueued)) &&
        !facts.isDraft &&
        !facts.fromFork &&
        facts.baseRef === defaultBranch &&
        !isVersionBranch(facts.headRef, defaultBranch) &&
        isWorkers(facts.number) &&
        Result.isOk(facts.comparison) &&
        facts.comparison.value.behindBy > 0
      );
    })
    .map(({ facts }) => facts.number);
};

/**
 * The `merge-queued` pull requests whose head GitHub shows is not their
 * branch's tip: a push GitHub dropped, or one made a moment ago.
 */
const headsOutOfSync = (
  snapshot: Snapshot,
  decision: QueueDecision,
): readonly ConditionKey[] => {
  const { branchTips } = snapshot;

  if (Result.isErr(branchTips)) {
    return [];
  }

  return decision.pullRequests
    .filter(({ facts }) => {
      const tip = branchTips.value.get(facts.headRef);

      return (
        !facts.fromFork &&
        hasLabel(labelNames(facts.labels), PullRequestLabel.mergeQueued) &&
        tip !== undefined &&
        tip !== facts.headSha
      );
    })
    .map(({ facts }) => ({
      number: facts.number,
      head: facts.headSha,
      kind: 'head-out-of-sync',
    }));
};

const conditionDetail = (
  kind: Parameters<typeof observeConditions>[0][number]['kind'],
  count: number,
): string => {
  switch (kind) {
    case 'head-out-of-sync':
      return 'GitHub still shows a head that is not its branch tip';

    case 'review-unread':
      return `its review could not be read ${count} times`;

    case 'rerun-failed':
      return `asking for the re-run of its code-owner check failed ${count} times`;

    case 'push-failed':
      return `pushing to it failed ${count} times`;

    case 'arm-failed':
      return `arming auto-merge failed ${count} times`;

    case 'unlabel-failed':
      return `taking \`skip-ci\` off failed ${count} times`;

    case 'checks-unread':
      return `its checks could not be read ${count} times`;

    case 'checks-not-started':
      return 'GitHub started no check workflow on its head';
  }
};

/**
 * The set-asides the conditions have turned into, for pull requests the worker
 * owns. The watch judges its own `checks-unread` and `checks-not-started`.
 */
const conditionSetAsides = (
  conditions: Parameters<typeof observeConditions>[0],
  nowEpochMs: number,
  isWorkers: (number: number) => boolean,
  watched: number | undefined,
): readonly SetAsideDecision[] =>
  Arr.uniqBy(
    Arr.generate(function* () {
      for (const condition of conditions) {
        if (
          !isWorkers(condition.number) ||
          (condition.number === watched &&
            (condition.kind === 'checks-unread' ||
              condition.kind === 'checks-not-started'))
        ) {
          continue;
        }

        const verdict = conditionVerdict(condition, nowEpochMs, false);

        if (verdict.kind === 'set-aside') {
          yield {
            number: condition.number,
            head: condition.head,
            reason: verdict.reason,
            detail: conditionDetail(condition.kind, condition.count),
          } satisfies SetAsideDecision;
        }
      }
    }),
    ({ number }) => number,
  );

/** The required check that enforces `CODEOWNERS`, where one does. */
const codeOwnerCheckOf = (snapshot: Snapshot): CodeOwnerCheck | undefined => {
  const { requirements } = snapshot;

  const { codeOwners } = snapshot.repository;

  if (Result.isErr(requirements) || Result.isErr(codeOwners)) {
    return undefined;
  }

  const text = codeOwners.value ?? '';

  const context = codeOwnersEnforcedBy(text);

  return context !== undefined &&
    codeOwnerGate(requirements.value, context) === 'check'
    ? { context, codeOwners: text }
    : undefined;
};

const nextRead = (
  step: CycleStep,
  idleCount: number,
  idleAfter: number,
): NextRead => {
  switch (step.kind) {
    case 'watch':
    case 'wait-for-layer':
      return 'poll';

    case 'sleep':
      return idleCount >= idleAfter ? 'idle' : 'active';

    case 'yield':
    case 'pause':
    case 'refire':
    case 'auto-fix':
    case 'rerun':
    case 'watch-ended':
    case 'pick':
    case 'keep-on-tip':
      return 'at-once';
  }
};

/**
 * The layer of `number` at its current head, as the snapshot read it: the head
 * it was built from and its tree.
 */
const layerTreeOf = (
  snapshot: Snapshot,
  number: number,
): Readonly<{ head: string; tree: string }> | undefined => {
  const layers = snapshot.queueLayers;

  const layer = Result.isOk(layers)
    ? layers.value.layers.find(({ origin }) => origin?.number === number)
    : undefined;

  return layer?.origin === undefined
    ? undefined
    : { head: layer.origin.builtFromHead, tree: layer.tree };
};

const isOf =
  (number: number) =>
  (entry: Readonly<{ number: number }>): boolean =>
    entry.number === number;

/** 32-bit FNV-1a, as hex: short enough to keep in the memory file. */
const fnv1a = (text: string): string => {
  const hash = Array.from(text).reduce(
    (acc, char) => Math.imul(acc ^ (char.codePointAt(0) ?? 0), 0x01_00_01_93),
    0x81_1c_9d_c5,
  );

  return (hash >>> 0).toString(16).padStart(8, '0');
};
