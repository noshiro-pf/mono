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
 * How many updates are propagating, across every observable, and the token of
 * the outermost one. A write nothing observes opens none
 * (`setNextIfUnobserved`).
 */
const mut_propagation: {
  depth: number;
  outermostToken: UpdateToken | undefined;
} = { depth: 0, outermostToken: undefined };

/**
 * Work deferred by {@link runAfterPropagation}, run once the outermost update
 * has reached every descendant.
 */
const mut_afterPropagation: (() => void)[] = [];

/**
 * Whether some observable's update is propagating right now. A root written to
 * while one is, is written to from inside a subscriber or a projection (#2336).
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

/**
 * Brackets one update a `startUpdate` opens (a write nothing observes opens
 * none); see {@link endPropagation}.
 */
export const beginPropagation = (updateToken: UpdateToken): void => {
  if (mut_propagation.depth === 0) {
    mut_propagation.outermostToken = updateToken;
  }

  mut_propagation.depth += 1;
};

/**
 * Ends one update, and runs the deferred work once the outermost one has ended.
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
 * The buckets of this copy's open updates, one set per nesting level: a bucket
 * per depth below the node that started the update, holding the queued nodes
 * and how many of its slots are in use. Kept from update to update, so that an
 * update allocates nothing but its token; emptying a bucket is setting its
 * length to 0.
 */
const mut_bucketSets: Bucket[][] = [];

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

  return toToken(new UpdateQueue(depth + 1, mut_queueState.level));
};

/**
 * How many updates of one copy may be open at once, one inside another. An
 * update opens inside another only when a subscriber or projection writes to a
 * root while the outer one is propagating; a chain of such writes this deep is
 * a loop that would otherwise run until the stack overflows.
 */
export const maxUpdateNesting = 100;

export const updateLoopMessage =
  `synstate: more than ${maxUpdateNesting.toString()} updates were nested, one started inside another: a subscriber or projection keeps writing to an observable whose update reaches it again. Make the write stop (a condition, or a value equal to the current one), or derive the value with map / combine.` as const;

/** Visits every node the update has queued, shallowest first. */
export const drainUpdate = (updateToken: UpdateToken): void => {
  toQueue(updateToken).drain();
};

/** Closes an update, emptying what an exception left in its buckets. */
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

// Written in place: a bucket is emptied by its length, not replaced.
// transformer-ignore-next-line convert-to-readonly
type Bucket = {
  /** The queued nodes at one depth; the slots from `length` on are unused. */
  // @sumi-expect-error readonly/require-readonly-type
  readonly nodes: (ChildNode | undefined)[];
  /** How many slots of `nodes` are in use. */
  // @sumi-expect-error readonly/require-readonly-type
  length: number;
};

/**
 * The queue of one update, and its token.
 *
 * A queued node is marked with the token of the update that queued it
 * (`queuedFor`), which is how an update queues a node once. The mark is not
 * cleared after the visit: a later update has another token. An update does not
 * overwrite the mark of an update that is still open — one it is nested in, or
 * one of another copy of synstate — and remembers the nodes it queues despite
 * such a mark in a set of its own instead.
 */
class UpdateQueue {
  readonly #base: number;

  /** `buckets[index]` holds the queued nodes at depth `base + index`. */
  // @sumi-expect-error readonly/require-readonly-type
  readonly #mut_buckets: Bucket[];

  #mut_size: number;

  #mut_isOpen: boolean;

  #mut_queuedDespiteMark: MutableSet<ChildNode> | undefined;

  /** `level` is 1 for the outermost update of this copy. */
  constructor(base: number, level: number) {
    this.#base = base;

    const mut_buckets = mut_bucketSets[level - 1] ?? [];

    mut_bucketSets[level - 1] = mut_buckets;

    this.#mut_buckets = mut_buckets;

    this.#mut_size = 0;

    this.#mut_isOpen = true;

    this.#mut_queuedDespiteMark = undefined;
  }

  #push(child: ChildNode): void {
    const index = child.depth - this.#base;

    const mut_buckets = this.#mut_buckets;

    while (mut_buckets.length <= index) {
      mut_buckets.push({ nodes: [], length: 0 });
    }

    if (index >= this.#mut_size) {
      this.#mut_size = index + 1;
    }

    // Defined: the loop above made it.
    // @sumi-expect-error banned-syntax/no-non-null-assertion
    const mut_bucket = mut_buckets[index]!;

    const { nodes: mut_nodes, length } = mut_bucket;

    if (length < mut_nodes.length) {
      mut_nodes[length] = child;
    } else {
      mut_nodes.push(child);
    }

    mut_bucket.length = length + 1;
  }

  /** Whether the update is still running; read across copies of synstate. */
  get isOpen(): boolean {
    return this.#mut_isOpen;
  }

  enqueueChildren(children: ReadonlySet<ChildNode>): void {
    const ownMark = toToken(this);

    for (const child of children) {
      const mark = child.queuedFor;

      if (mark === ownMark) {
        continue;
      }

      if (mark !== undefined && toQueue(mark).isOpen) {
        // Another open update has queued `child` and may not have visited it
        // yet: leave its mark alone.
        if (this.#mut_queuedDespiteMark === undefined) {
          this.#mut_queuedDespiteMark = new Set<ChildNode>();
        } else if (this.#mut_queuedDespiteMark.has(child)) {
          continue;
        }

        this.#mut_queuedDespiteMark.add(child);
      } else {
        child.setQueuedFor(ownMark);
      }

      this.#push(child);
    }
  }

  drain(): void {
    const token = toToken(this);

    const mut_buckets = this.#mut_buckets;

    // `size` grows while the buckets are visited, always past `index`, which a
    // `range` built at the start would miss.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_index = 0; mut_index < this.#mut_size; mut_index += 1) {
      const mut_bucket = mut_buckets[mut_index];

      if (mut_bucket === undefined) {
        continue;
      }

      // A node visited here queues only deeper nodes, so this bucket does not
      // grow while it is visited. Its length is kept until the end, so that
      // `close` can clear what an exception leaves.
      const { nodes: mut_nodes, length } = mut_bucket;

      // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
      for (let mut_slot = 0; mut_slot < length; mut_slot += 1) {
        const node = mut_nodes[mut_slot];

        // Drops the reference, so that a node completed and dropped by
        // everything else is not kept alive by a slot.
        mut_nodes[mut_slot] = undefined;

        if (node !== undefined && !node.isCompleted) {
          node.tryUpdate(token);
        }
      }

      mut_bucket.length = 0;
    }

    this.#mut_size = 0;
  }

  close(): void {
    const mut_buckets = this.#mut_buckets;

    // Only after an exception is anything left.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_index = 0; mut_index < this.#mut_size; mut_index += 1) {
      const mut_bucket = mut_buckets[mut_index];

      if (mut_bucket === undefined) {
        continue;
      }

      mut_bucket.nodes.fill(undefined, 0, mut_bucket.length);

      mut_bucket.length = 0;
    }

    this.#mut_size = 0;

    this.#mut_isOpen = false;

    this.#mut_queuedDespiteMark = undefined;
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
