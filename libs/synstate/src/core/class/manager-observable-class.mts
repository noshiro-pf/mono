// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import type { Optional } from 'ts-data-forge';
import type { MutableSet } from 'ts-type-forge';
import type { ManagerObservableKind, UpdateToken } from '../types/index.mjs';
import { issueUpdateToken } from '../utils/index.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';
import type { ChildNode, ManagerNode } from './observable-node.mjs';
import { beginPropagation, endPropagation } from './propagation-state.mjs';

/**
 * The base of the observables that start updates of their own: a root, and
 * an async child (`debounce`, `switchMap`), which emits later than its
 * parents do. Every descendant registers to the managers it is reached from,
 * and an update reaches them in ascending depth, so that each sees its
 * parents' values of that update (no glitch).
 */
export class ManagerObservableClass<
  A,
  Kind extends ManagerObservableKind,
  Depth extends number,
> extends ObservableBaseClass<A, Kind, Depth> {
  /**
   * The descendants, by depth: the set at index `i` holds those at
   * `depth + 1 + i`, in the order they registered. Depths below a live node
   * never skip one (every live node has a live parent one level up), so the
   * array has few holes; a hole is `undefined`, never a gap left for V8 to
   * treat as a holey array.
   *
   * An update walks this array and its sets in place. Adding or removing a
   * node is O(1) and there is no flat order to rebuild. The first node of a
   * depth extends the array in place, except during this node's own update,
   * when it replaces the array with a longer copy so that the walk keeps the
   * array it began on; copying every time made a deep graph with many roots
   * cubic to build, each root copying its array once per depth. A node
   * deleted during the walk is skipped by the set's iterator; a node
   * registered during it is also put in `#mut_joinedDuringUpdate` and
   * skipped, so an update visits the nodes that existed when it began.
   */
  // @sumi-expect-error readonly/require-readonly-type
  #mut_propagationOrder: (MutableSet<ChildNode> | undefined)[];

  /** Whether this node is propagating an update of its own. */
  #mut_isPropagating: boolean;

  /**
   * The descendants that registered while this node propagated the update
   * under way, which that update does not visit; made when the first one
   * arrives. Kept on the manager rather than in a module, so that it also
   * holds for a node another copy of synstate registered.
   */
  #mut_joinedDuringUpdate: MutableSet<ChildNode> | undefined;

  /** The managers this node's descendants register to: itself. */
  readonly managers: readonly ManagerNode[];

  constructor(
    config: Readonly<{
      kind: Kind;
      depth: Depth;
      initialValue: Optional<A>;
    }>,
  ) {
    super(config);

    this.managers = [this];

    this.#mut_propagationOrder = [];

    this.#mut_isPropagating = false;

    this.#mut_joinedDuringUpdate = undefined;
  }

  /**
   * Runs `tryUpdate` on the descendants, shallowest first, skipping those
   * registered after this update began.
   */
  #propagate(updateToken: UpdateToken): void {
    for (const bucket of this.#mut_propagationOrder) {
      if (bucket !== undefined) {
        for (const c of bucket) {
          // Read for each node, since the set is made when the first joins.
          if (this.#mut_joinedDuringUpdate?.has(c) !== true) {
            c.tryUpdate(updateToken);
          }
        }
      }
    }
  }

  addDescendant(child: ChildNode): void {
    const descendants = this.#mut_propagationOrder;

    const index = child.depth - this.depth - 1;

    const mut_bucket = descendants[index];

    if (mut_bucket === undefined) {
      if (this.#mut_isPropagating) {
        // A walk is under way on this array; it keeps the old one.
        this.#mut_propagationOrder = Array.from(
          { length: Math.max(descendants.length, index + 1) },
          (_, i) => (i === index ? new Set([child]) : descendants[i]),
        );
      } else {
        // Filled up to `index` with `undefined`, so that the array has no gap.
        while (descendants.length < index) {
          descendants.push(undefined);
        }

        descendants[index] = new Set([child]);
      }
    } else {
      mut_bucket.add(child);
    }

    if (!this.#mut_isPropagating) {
      return;
    }

    this.#mut_joinedDuringUpdate ??= new Set();

    this.#mut_joinedDuringUpdate.add(child);
  }

  deleteDescendant(child: ChildNode): void {
    // An emptied set stays, to be reused by the next node of its depth.
    this.#mut_propagationOrder[child.depth - this.depth - 1]?.delete(child);
  }

  /** Emits `nextValue` and propagates it to the descendants. */
  protected startUpdate(nextValue: A): void {
    const updateToken = issueUpdateToken();

    // A write to this same manager from inside its own update starts an inner
    // one; what joins during it joined during the outer one too.
    const wasPropagating = this.#mut_isPropagating;

    const joinedBefore = this.#mut_joinedDuringUpdate;

    this.#mut_isPropagating = true;

    this.#mut_joinedDuringUpdate = undefined;

    beginPropagation(updateToken);

    // A subscriber or projection may throw, and the depth has to come back
    // down regardless, or every later write would warn. The exception itself
    // is not caught: it reaches the caller of `next` as it always has.
    // @sumi-expect-error exceptions/no-try
    try {
      this.setNext(nextValue, updateToken);

      this.#propagate(updateToken);
    } finally {
      // Widened: TypeScript would take the write above for the value.
      const joinedNow = this.#mut_joinedDuringUpdate as
        MutableSet<ChildNode> | undefined;

      this.#mut_isPropagating = wasPropagating;

      this.#mut_joinedDuringUpdate = joinedBefore;

      if (wasPropagating && joinedNow !== undefined) {
        this.#mut_joinedDuringUpdate ??= new Set();

        for (const c of joinedNow) {
          this.#mut_joinedDuringUpdate.add(c);
        }
      }

      endPropagation();
    }
  }
}
