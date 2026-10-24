// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
/**
 * The state of the update propagating now, shared by every observable.
 *
 * It is module state rather than a field of a class, so that nothing outside
 * this file can reach it but through the functions below: an exported class
 * would hand its static fields to every importer, and a private static field
 * costs about twice as much per access as a module binding, on a path every
 * update takes.
 */
import { Arr } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type { MutableSet } from 'ts-type-forge';
import type { UpdateToken } from '../types/index.mjs';
import type { ChildNode } from './observable-node.mjs';

/**
 * How many `startUpdate` calls are running, across every observable, and
 * the token of the outermost one.
 */
const mut_propagation: {
  depth: number;
  outermostToken: UpdateToken | undefined;
} = { depth: 0, outermostToken: undefined };

/**
 * Work deferred by {@link runAfterPropagation}, run once the outermost
 * `startUpdate` has reached every descendant.
 */
const mut_afterPropagation: (() => void)[] = [];

/**
 * Whether some observable's update is propagating right now. A root written
 * to while one is, is written to from inside a subscriber or a projection
 * (#2336).
 */
export const isPropagating = (): boolean => mut_propagation.depth > 0;

/** The token of the outermost update propagating now, if any. */
export const outermostUpdateToken = (): UpdateToken | undefined =>
  mut_propagation.outermostToken;

/**
 * Runs `task` once the update now propagating has reached every descendant, or
 * at once when none is. A child that completes itself in its `tryUpdate`
 * completes its children with it, before they have seen the value it has just
 * passed on (`take`).
 */
export const runAfterPropagation = (task: () => void): void => {
  if (isPropagating()) {
    mut_afterPropagation.push(task);
  } else {
    task();
  }
};

/** Brackets one `startUpdate`; see {@link endPropagation}. */
export const beginPropagation = (updateToken: UpdateToken): void => {
  if (mut_propagation.depth === 0) {
    mut_propagation.outermostToken = updateToken;
  }

  mut_propagation.depth += 1;
};

/**
 * Ends one `startUpdate`, and runs the deferred work once the outermost one
 * has ended.
 */
export const endPropagation = (): void => {
  mut_propagation.depth -= 1;

  if (mut_propagation.depth > 0) {
    return;
  }

  mut_propagation.outermostToken = undefined;

  // A deferred task may start an update of its own, which flushes what that
  // update defers before this loop moves on.
  while (Arr.isNonEmpty(mut_afterPropagation)) {
    mut_afterPropagation.shift()?.();
  }
};

/**
 * The lists of this copy's outermost update: one per depth below the node
 * that started it, linked through each node's `nextInQueue`. Kept from update
 * to update, so that an update allocates nothing but its token.
 */
const mut_heads: (ChildNode | undefined)[] = [];

const mut_tails: (ChildNode | undefined)[] = [];

/** How many updates of this copy are open, the outermost included. */
const mut_queueState: { level: number } = { level: 0 };

/**
 * Opens an update started by a node at `depth`, and returns its token. The
 * token is the update's queue: a node that emits with it puts its children
 * there, whichever copy of synstate the node belongs to, so that an update
 * reaches every node its value reaches, and each once, in ascending depth.
 * Close it with {@link closeUpdate}.
 */
export const openUpdate = (depth: number): UpdateToken => {
  if (mut_queueState.level >= maxUpdateNesting) {
    // A programming error, as a circular dependency is: `panic` keeps the
    // `Result` boundaries from turning it into an `Err`. Thrown before this
    // update opens, so only the updates around it close, each in its own
    // `startUpdate`'s `finally`.
    panic(updateLoopMessage);
  }

  mut_queueState.level += 1;

  return toToken(new UpdateQueue(depth + 1, mut_queueState.level === 1));
};

/**
 * How many updates of one copy may be open at once, one inside another. An
 * update opens inside another only when a subscriber or projection writes to
 * a root while the outer one is propagating; a chain of such writes this deep
 * is a loop that would otherwise run until the stack overflows.
 */
export const maxUpdateNesting = 100;

export const updateLoopMessage =
  `synstate: more than ${maxUpdateNesting.toString()} updates were nested, one started inside another: a subscriber or projection keeps writing to an observable whose update reaches it again. Make the write stop (a condition, or a value equal to the current one), or derive the value with map / combine.` as const;

/** Visits every node the update has queued, shallowest first. */
export const drainUpdate = (updateToken: UpdateToken): void => {
  toQueue(updateToken).drain();
};

/** Closes an update, unlinking what an exception left in its lists. */
export const closeUpdate = (updateToken: UpdateToken): void => {
  toQueue(updateToken).close();

  mut_queueState.level -= 1;
};

/**
 * Puts the children of a node that emitted with `updateToken` into that
 * update's queue. The update may belong to another copy of synstate.
 */
export const enqueueChildren = (
  children: ReadonlySet<ChildNode>,
  updateToken: UpdateToken,
): void => {
  toQueue(updateToken).enqueueChildren(children);
};

/**
 * The queue of one update, and its token.
 *
 * A node waits in one list at a time, since it has one `nextInQueue`. The
 * outermost update of this copy links the nodes no other update holds into
 * `mut_heads` / `mut_tails`, marking each with `queuedFor` until it is
 * visited. Every other node it reaches goes to `spill`, a set and an array
 * per depth made on first use: a node waiting in another update's lists —
 * of an update this one is nested in, or of another copy's — and every node
 * of an update nested in this copy's outermost, which owns the lists.
 */
class UpdateQueue {
  readonly #base: number;

  readonly #ownsLists: boolean;

  #mut_size: number;

  // @sumi-expect-error readonly/require-readonly-type
  #mut_spill: (ChildNode[] | undefined)[] | undefined;

  #mut_spilled: MutableSet<ChildNode> | undefined;

  constructor(base: number, ownsLists: boolean) {
    this.#base = base;

    this.#ownsLists = ownsLists;

    this.#mut_size = 0;

    this.#mut_spill = undefined;

    this.#mut_spilled = undefined;
  }

  #spill(child: ChildNode, index: number): void {
    if (this.#mut_spilled === undefined) {
      this.#mut_spilled = new Set();
    }

    this.#mut_spilled.add(child);

    if (this.#mut_spill === undefined) {
      this.#mut_spill = [];
    }

    const mut_spill = this.#mut_spill;

    while (mut_spill.length <= index) {
      mut_spill.push(undefined);
    }

    const mut_bucket = mut_spill[index];

    if (mut_bucket === undefined) {
      mut_spill[index] = [child];
    } else {
      mut_bucket.push(child);
    }
  }
  enqueueChildren(children: ReadonlySet<ChildNode>): void {
    const token = toToken(this);

    for (const child of children) {
      const queuedFor = child.queuedFor;

      if (queuedFor === token || this.#mut_spilled?.has(child) === true) {
        continue;
      }

      const index = child.depth - this.#base;

      if (index >= this.#mut_size) {
        this.#mut_size = index + 1;
      }

      if (queuedFor !== undefined || !this.#ownsLists) {
        this.#spill(child, index);

        continue;
      }

      child.setQueuedFor(token);

      const tail = mut_tails[index];

      if (tail === undefined) {
        mut_heads[index] = child;
      } else {
        tail.linkNextInQueue(child);
      }

      mut_tails[index] = child;
    }
  }

  drain(): void {
    const token = toToken(this);

    // `size` grows while the lists are walked, always past `index`, which a
    // `range` built at the start would miss.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_index = 0; mut_index < this.#mut_size; mut_index += 1) {
      if (this.#ownsLists) {
        let mut_curr = mut_heads[mut_index];

        mut_heads[mut_index] = undefined;

        mut_tails[mut_index] = undefined;

        while (mut_curr !== undefined) {
          const next = mut_curr.nextInQueue;

          // Free for another update from here on: none of this node's
          // parents emits again in this one, since they are all shallower.
          mut_curr.linkNextInQueue(undefined);

          mut_curr.setQueuedFor(undefined);

          if (!mut_curr.isCompleted) {
            mut_curr.tryUpdate(token);
          }

          mut_curr = next;
        }
      }

      for (const node of this.#mut_spill?.[mut_index] ?? []) {
        if (!node.isCompleted) {
          node.tryUpdate(token);
        }
      }
    }

    // Every list is empty now; `close` has nothing to unlink.
    this.#mut_size = 0;
  }

  close(): void {
    if (!this.#ownsLists) {
      return;
    }

    // `range` builds an array, and this runs on every update.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_index = 0; mut_index < this.#mut_size; mut_index += 1) {
      let mut_curr = mut_heads[mut_index];

      mut_heads[mut_index] = undefined;

      mut_tails[mut_index] = undefined;

      while (mut_curr !== undefined) {
        const next = mut_curr.nextInQueue;

        mut_curr.linkNextInQueue(undefined);

        mut_curr.setQueuedFor(undefined);

        mut_curr = next;
      }
    }
  }
}

/**
 * A token as the queue it is. A token reaches this copy from a node of any
 * copy, and every copy's tokens have `enqueueChildren`.
 */
const toQueue = (updateToken: UpdateToken): UpdateQueue =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  updateToken as unknown as UpdateQueue;

const toToken = (queue: UpdateQueue): UpdateToken =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  queue as unknown as UpdateToken;
