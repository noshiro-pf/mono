/**
 * The scheduler: one queue for the whole program, driven by an integer epoch.
 *
 * An update is a number, not an object. A node knows it is queued for the
 * current update when its `queuedAt` equals the epoch, and a node is queued
 * only because a parent emitted, so a node with one parent never asks which
 * parent changed. See DESIGN.md, "Propagation".
 *
 * One update (a round) runs in two phases:
 *
 * 1. The drain visits the queued nodes in ascending depth. A node that emits
 *    queues its children: derived nodes go to the depth buckets, effects to the
 *    effect queue.
 * 2. The effects run, in the order they were queued, against a graph that has
 *    settled.
 *
 * A write made during the drain is deferred until the drain ends; a write made
 * by an effect (or a mount) starts the next round. Updates never nest.
 *
 * A node that emitted outside the drain waits in `pending` for the next round,
 * marked by `queuedAt === -pendingGeneration` (a drain mark is a positive
 * epoch), so writing a state twice before the round queues it once.
 */
import { untracked } from './owner.mjs';

/** What the scheduler needs of a node it queues: a derived node or an effect. */
export type QueuedNode = DerivedNode | EffectNode;

// The scheduler writes `queuedAt` and `changedAt` in place.
// transformer-ignore-next-line convert-to-readonly
export type DerivedNode = {
  readonly isEffect: false;
  queuedAt: number;
  readonly disposed: boolean;
  /**
   * Whether its parents may forget it: disposed, or detached (a `take` that is
   * done). The queue skips it and `childGone` compacts it away.
   */
  readonly gone: boolean;
  readonly depth: number;
  changedAt: number;
  /** The `writeCount` at its creation; see `enqueueChildren`. */
  readonly bornAt: number;
  /** The `writeCount` at its latest emission; see `enqueueChildren`. */
  emittedAt: number;
  readonly children: readonly QueuedNode[] | undefined;
  /** Recomputes; returns whether the value changed. */
  recompute: () => boolean;
};

// transformer-ignore-next-line convert-to-readonly
export type EffectNode = {
  readonly isEffect: true;
  queuedAt: number;
  readonly disposed: boolean;
  /** Whether it is disposed; see `DerivedNode.gone`. */
  readonly gone: boolean;
  /** The `writeCount` at its creation; see `enqueueChildren`. */
  readonly bornAt: number;
  run: () => void;
};

/**
 * idle: no update; drain: visiting nodes; effects: running effects; settle:
 * applying the deferred writes and the queued emissions once the effects ran.
 */
type Phase = 'drain' | 'effects' | 'idle' | 'settle';

// Module state. The arrays keep their length in a counter: `length = 0` drops
// the backing store and reallocates it on the next push, which used to cost
// more than the update itself.
const mut_state = {
  epoch: 1,
  /** Counts the emissions; see `enqueueChildren`. */
  writeCount: 0,
  /** Counts the rounds that took `pending`; see `isPending`. */
  pendingGeneration: 1,
  phase: 'idle' as Phase,
  /** The epoch of the latest round; see `awaitsEffects`. */
  roundEpoch: 0,
  batchDepth: 0,
  pendingLength: 0,
  effectsLength: 0,
  deferredLength: 0,
  afterNextRoundLength: 0,
  /** Whether a write made since the last round counts toward `maxRounds`. */
  countsRound: false,
  /** Set while the callbacks of `afterNextRound` run. */
  inQueuedEmission: false,
  minDepth: Number.POSITIVE_INFINITY,
  maxDepth: -1,
};

/** Nodes that emitted outside the drain: writes, async operators. */
const mut_pending: (DerivedNode | undefined)[] = [];

/**
 * Writes made during the drain, and emissions that wait for the effects (see
 * `deferEmission`), applied in order once the effects have run.
 */
const mut_deferred: ((() => void) | QueuedEmitter | undefined)[] = [];

/**
 * What waits for the next round to have propagated; see `afterNextRound`.
 * `drop` is called instead of `emitNext` when an exception empties the queues.
 */
export type QueuedEmitter = Readonly<{
  emitNext: () => void;
  drop: () => void;
}>;

const mut_afterNextRound: (QueuedEmitter | undefined)[] = [];

/** `mut_buckets[d]` holds the queued nodes of depth `d`. */
const mut_buckets: (DerivedNode | undefined)[][] = [];

const mut_bucketLengths: number[] = [];

const mut_effects: (EffectNode | undefined)[] = [];

/**
 * How many rounds one flush may run. A round starts when an effect writes; an
 * effect that keeps writing to what its own update reaches is a loop. A round
 * that delivers a queued value of an event source does not count, and starts
 * the count again: each one consumes a value written before it.
 */
export const maxRounds = 100;

/**
 * The rounds one flush may run however they started: a source whose subscribers
 * write it twice for every value would otherwise never stop.
 */
const maxAllRounds = 1_000_000;

export const loopMessage =
  `synstate-next: more than ${maxRounds.toString()} rounds in one flush: an effect keeps writing to a state that its own update reaches. Make the write stop, or derive the value with map / derive.` as const;

const sourceLoopMessage =
  `synstate-next: more than ${maxAllRounds.toString()} rounds in one flush: an event source keeps receiving values faster than its rounds deliver them, which happens when its own subscribers write to it more than once per value.` as const;

/** The current epoch. A node that emitted in this update has it as `changedAt`. */
export const currentEpoch = (): number => mut_state.epoch;

/**
 * The number of emissions so far. A node records it when it is created
 * (`bornAt`), and again whenever it emits (`emittedAt`).
 */
export const writeCount = (): number => mut_state.writeCount;

/** Whether the drain is running: a write now has to wait for it to end. */
export const isDraining = (): boolean => mut_state.phase === 'drain';

/** Whether `node` emitted outside the drain and waits for the next round. */
export const isPending = (node: DerivedNode): boolean =>
  node.queuedAt === -mut_state.pendingGeneration;

/**
 * Whether `node` emitted in the round under way and that round's effects have
 * yet to run (or are running): they read its value, so nothing may overwrite it
 * before the round is over.
 */
export const awaitsEffects = (node: DerivedNode): boolean =>
  isPropagating() && node.changedAt === mut_state.roundEpoch;

/**
 * Whether a round is draining or running its effects: what it carries has yet
 * to reach every effect.
 */
export const isPropagating = (): boolean =>
  mut_state.phase === 'drain' || mut_state.phase === 'effects';

/**
 * Calls `emitter.emitNext` once the next round has propagated, to emit a value
 * that had to wait for it: an event source written twice before a round
 * delivers each value in a round of its own. The rounds it starts do not count
 * toward `maxRounds`.
 */
export const afterNextRound = (emitter: QueuedEmitter): void => {
  mut_afterNextRound[mut_state.afterNextRoundLength] = emitter;

  mut_state.afterNextRoundLength += 1;
};

/** Applies `write` once the drain ends. */
export const deferWrite = (write: () => void): void => {
  mut_deferred[mut_state.deferredLength] = write;

  mut_state.deferredLength += 1;
};

/**
 * Calls `emitter.emitNext` where a deferred write made now would apply: once
 * the drain and the effects of the round under way have run, in order with the
 * writes deferred before it. An exception calls `drop` instead.
 */
export const deferEmission = (emitter: QueuedEmitter): void => {
  mut_deferred[mut_state.deferredLength] = emitter;

  mut_state.deferredLength += 1;
};

/**
 * Puts `node`'s children in the queue of the current epoch.
 *
 * A child created after `node`'s latest emission is skipped: a node sees the
 * emissions made after it was created, and what came before only as the value
 * its parent holds, whether the round has propagated yet or not. A `take`, a
 * `zip` or a subscriber made in the batch that wrote its source would otherwise
 * count that value twice, and a `merge` or `debounce` made there would see an
 * emission that one made after the batch does not.
 */
export const enqueueChildren = (node: DerivedNode): void => {
  const { children } = node;

  if (children === undefined) {
    return;
  }

  const { epoch } = mut_state;

  const emittedAt = node.emittedAt;

  for (const child of children) {
    if (child.queuedAt === epoch || child.gone || child.bornAt >= emittedAt) {
      continue;
    }

    // eslint-disable-next-line functional/immutable-data
    child.queuedAt = epoch;

    if (child.isEffect) {
      mut_effects[mut_state.effectsLength] = child;

      mut_state.effectsLength += 1;
    } else {
      pushToBucket(child);
    }
  }
};

/**
 * Marks `node` as having emitted outside the drain, and propagates unless a
 * batch or a flush is under way. `hasObserver` false is the fast path: there is
 * nothing to reach, so the write costs one increment.
 */
export const emit = (node: DerivedNode, hasObserver: boolean): void => {
  if (!hasObserver) {
    mut_state.epoch += 1;

    // eslint-disable-next-line functional/immutable-data
    node.changedAt = mut_state.epoch;

    return;
  }

  stampEmission(node);

  if (!mut_state.inQueuedEmission) {
    mut_state.countsRound = true;
  }

  const mark = -mut_state.pendingGeneration;

  if (node.queuedAt === mark) {
    // Already pending: the round reads the value it holds now.
    return;
  }

  // eslint-disable-next-line functional/immutable-data
  node.queuedAt = mark;

  mut_pending[mut_state.pendingLength] = node;

  mut_state.pendingLength += 1;

  if (mut_state.phase === 'idle' && mut_state.batchDepth === 0) {
    flush();
  }
};

/**
 * Runs `fn`, and propagates every write it makes in one update once it returns.
 * Batches nest; the outermost one propagates.
 */
export const batch = <R,>(fn: () => R): R => {
  mut_state.batchDepth += 1;

  try {
    return fn();
  } finally {
    mut_state.batchDepth -= 1;

    if (mut_state.batchDepth === 0 && mut_state.phase === 'idle') {
      flush();
    }
  }
};

/** Numbers an emission of `node`; see `enqueueChildren`. */
const stampEmission = (node: DerivedNode): void => {
  mut_state.writeCount += 1;

  // eslint-disable-next-line functional/immutable-data
  node.emittedAt = mut_state.writeCount;
};

const pushToBucket = (node: DerivedNode): void => {
  const { depth } = node;

  while (mut_buckets.length <= depth) {
    mut_buckets.push([]);

    mut_bucketLengths.push(0);
  }

  // Defined: the loop above made them.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const mut_bucket = mut_buckets[depth]!;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const length = mut_bucketLengths[depth]!;

  mut_bucket[length] = node;

  mut_bucketLengths[depth] = length + 1;

  if (depth < mut_state.minDepth) {
    mut_state.minDepth = depth;
  }

  if (depth > mut_state.maxDepth) {
    mut_state.maxDepth = depth;
  }
};

/** Visits the queued nodes, shallowest first. */
const drain = (): void => {
  const { epoch } = mut_state;

  // `maxDepth` grows while the buckets are visited.

  for (
    let mut_d = mut_state.minDepth;
    mut_d <= mut_state.maxDepth;
    mut_d += 1
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const length = mut_bucketLengths[mut_d]!;

    if (length === 0) {
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mut_bucket = mut_buckets[mut_d]!;

    // A node visited here queues only deeper nodes, so this bucket does not
    // grow while it is visited.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_i = 0; mut_i < length; mut_i += 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const node = mut_bucket[mut_i]!;

      // Drops the reference, so that a disposed node is not kept alive.

      mut_bucket[mut_i] = undefined;

      // `gone`: a node detached in this drain (a `take` that finished) is not
      // recomputed again.
      if (node.gone || !node.recompute()) {
        continue;
      }

      // eslint-disable-next-line functional/immutable-data
      node.changedAt = epoch;

      stampEmission(node);

      enqueueChildren(node);
    }

    mut_bucketLengths[mut_d] = 0;
  }

  mut_state.minDepth = Number.POSITIVE_INFINITY;

  mut_state.maxDepth = -1;
};

const runEffects = (): void => {
  // An effect's write goes to `pending`, so nothing joins this queue while it
  // runs, and an exception leaves the rest of it for `clearQueues`.
  const length = mut_state.effectsLength;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let mut_i = 0; mut_i < length; mut_i += 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const effect = mut_effects[mut_i]!;

    mut_effects[mut_i] = undefined;

    if (!effect.gone) {
      effect.run();
    }
  }

  mut_state.effectsLength = 0;
};

/** Empties every queue, after an exception. */
const clearQueues = (): void => {
  for (const [mut_d, mut_bucket] of mut_buckets.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const length = mut_bucketLengths[mut_d]!;

    if (length <= 0) {
      continue;
    }

    mut_bucket.fill(undefined, 0, length);

    mut_bucketLengths[mut_d] = 0;
  }

  mut_state.minDepth = Number.POSITIVE_INFINITY;

  mut_state.maxDepth = -1;

  mut_effects.fill(undefined, 0, mut_state.effectsLength);

  mut_state.effectsLength = 0;

  mut_pending.fill(undefined, 0, mut_state.pendingLength);

  mut_state.pendingLength = 0;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let mut_i = 0; mut_i < mut_state.deferredLength; mut_i += 1) {
    const write = mut_deferred[mut_i];

    mut_deferred[mut_i] = undefined;

    if (write !== undefined && typeof write !== 'function') {
      write.drop();
    }
  }

  mut_state.deferredLength = 0;

  const waiting = mut_state.afterNextRoundLength;

  mut_state.afterNextRoundLength = 0;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let mut_i = 0; mut_i < waiting; mut_i += 1) {
    const emitter = mut_afterNextRound[mut_i];

    mut_afterNextRound[mut_i] = undefined;

    emitter?.drop();
  }

  mut_state.countsRound = false;

  // What was pending is not any more.
  mut_state.pendingGeneration += 1;
};

/**
 * Runs the callbacks of `afterNextRound` registered before this round started
 * (`count` of them), and keeps those registered since for the round after.
 */
const runAfterRound = (count: number): void => {
  mut_state.inQueuedEmission = true;

  try {
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_i = 0; mut_i < count; mut_i += 1) {
      const emitter = mut_afterNextRound[mut_i];

      mut_afterNextRound[mut_i] = undefined;

      emitter?.emitNext();
    }
  } finally {
    mut_state.inQueuedEmission = false;
  }

  if (count === 0) {
    return;
  }

  const length = mut_state.afterNextRoundLength;

  // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
  for (let mut_i = count; mut_i < length; mut_i += 1) {
    mut_afterNextRound[mut_i - count] = mut_afterNextRound[mut_i];

    mut_afterNextRound[mut_i] = undefined;
  }

  mut_state.afterNextRoundLength = length - count;
};

const flushRounds = (): void => {
  let mut_rounds = 0;

  let mut_all = 0;

  try {
    while (
      mut_state.pendingLength > 0 ||
      mut_state.deferredLength > 0 ||
      mut_state.afterNextRoundLength > 0
    ) {
      mut_all += 1;

      if (mut_state.countsRound) {
        mut_rounds += 1;
      }

      if (mut_rounds > maxRounds) {
        throw new Error(loopMessage);
      }

      if (mut_all > maxAllRounds) {
        throw new Error(sourceLoopMessage);
      }

      mut_state.countsRound = false;

      const waiting = mut_state.afterNextRoundLength;

      if (waiting > 0) {
        mut_rounds = 0;
      }

      if (mut_state.pendingLength > 0) {
        mut_state.epoch += 1;

        mut_state.pendingGeneration += 1;

        const { epoch } = mut_state;

        mut_state.roundEpoch = epoch;

        mut_state.phase = 'drain';

        const length = mut_state.pendingLength;

        mut_state.pendingLength = 0;

        // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
        for (let mut_i = 0; mut_i < length; mut_i += 1) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const node = mut_pending[mut_i]!;

          mut_pending[mut_i] = undefined;

          // eslint-disable-next-line functional/immutable-data
          node.changedAt = epoch;

          enqueueChildren(node);
        }

        drain();

        mut_state.phase = 'effects';

        runEffects();
      }

      mut_state.phase = 'settle';

      // A write outside the drain goes to `pending`, so the list cannot grow
      // while it runs, and an exception leaves it for `clearQueues`.
      // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
      for (let mut_i = 0; mut_i < mut_state.deferredLength; mut_i += 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const write = mut_deferred[mut_i]!;

        mut_deferred[mut_i] = undefined;

        if (typeof write === 'function') {
          write();
        } else {
          write.emitNext();
        }
      }

      mut_state.deferredLength = 0;

      runAfterRound(waiting);
    }
  } catch (error) {
    clearQueues();

    throw error;
  } finally {
    mut_state.phase = 'idle';
  }
};

/** Runs rounds until nothing is pending. */
const flush = (): void => {
  // What effects and recomputes create belongs to no owner: not to the one that
  // happened to be current when the write was made.
  untracked(flushRounds);
};
