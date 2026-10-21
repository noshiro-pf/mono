import { Arr, Optional } from 'ts-data-forge';
import { unreachable } from 'ts-std-forge';
import type { Observable, Subscription, UpdateToken } from '../types/index.mjs';
import {
  getCurrentScopeInternals,
  issueUpdateToken,
  toSubscriber,
} from '../utils/index.mjs';
import { asMutable, toRecord, type NodeRecord } from './observable-node.mjs';

/**
 * Joins the scope whose `run` is executing (`createScope`), if any. A node
 * that completed while it was built (`just`, a child of completed parents)
 * has nothing left to release.
 */
export const adoptIntoCurrentScope = <A,>(node: NodeRecord<A>): void => {
  const mut_node = asMutable(node);

  const scope = getCurrentScopeInternals();

  if (scope !== undefined && !mut_node.isCompleted) {
    mut_node.releaseFromScope = scope.adopt(toPublic(mut_node));
  }
};

/** Stores `nextValue` as the current value and notifies subscribers. */
export const setNext = <A,>(
  node: NodeRecord<A>,
  nextValue: A,
  updateToken: UpdateToken,
): void => {
  const mut_node = asMutable(node);

  mut_node.updateToken = updateToken;

  mut_node.snapshot = Optional.some(nextValue);

  if (mut_node.subscribers !== undefined) {
    for (const s of mut_node.subscribers) {
      s.onNext(nextValue);
    }
  }
};

/** Emits `nextValue` from a manager and propagates it to its descendants. */
export const startUpdate = <A,>(node: NodeRecord<A>, nextValue: A): void => {
  const updateToken = issueUpdateToken();

  const mut_node = asMutable(node);

  // A write to this same manager from inside its own update starts an inner
  // one; what joins during it joined during the outer one too.
  const wasPropagating = mut_node.isPropagating;

  const mut_joinedBefore = mut_node.joinedDuringUpdate;

  mut_node.isPropagating = true;

  mut_node.joinedDuringUpdate = undefined;

  mut_propagation.depth += 1;

  // A subscriber or projection may throw, and the depth has to come back
  // down regardless, or every later write would warn. The exception itself
  // is not caught: it reaches the caller of `next` as it always has.
  // @sumi-expect-error exceptions/no-try
  try {
    setNext(node, nextValue, updateToken);

    propagate(node, updateToken);
  } finally {
    // Through `node`: TypeScript would take the write above for the value.
    const joinedNow = node.joinedDuringUpdate;

    mut_node.isPropagating = wasPropagating;

    mut_node.joinedDuringUpdate = mut_joinedBefore;

    if (wasPropagating && joinedNow !== undefined) {
      mut_node.joinedDuringUpdate ??= new Set();

      for (const c of joinedNow) {
        mut_node.joinedDuringUpdate.add(c);
      }
    }

    mut_propagation.depth -= 1;

    if (mut_propagation.depth === 0) {
      flushAfterPropagation();
    }
  }
};

/**
 * Registers a teardown (`onComplete` tool) to run when the node completes,
 * in the order registered; one registered after that runs at once, since
 * `init` may complete the node before it gets to register.
 */
export const addTeardown = <A,>(
  node: NodeRecord<A>,
  teardown: () => void,
): void => {
  const mut_node = asMutable(node);

  if (mut_node.isCompleted) {
    teardown();
  } else {
    // Copied rather than pushed: a node rarely has more than one or two.
    mut_node.teardowns = Arr.toPushed(mut_node.teardowns ?? [], teardown);
  }
};

/**
 * Completes the node: an async child first passes on what it still holds
 * (`flush`), then it is disposed. Completing never reaches the parents: an
 * upstream observable may be shared, and only whoever owns it decides when
 * it ends (#2133).
 */
export const completeNode = <A,>(node: NodeRecord<A>): void => {
  const mut_node = asMutable(node);

  if (mut_node.isCompleted) {
    return;
  }

  mut_node.flush?.();

  disposeNode(mut_node);
};

/**
 * Completes the node without passing on anything it still holds, runs its
 * teardowns, and takes it out of the graph.
 */
export const disposeNode = <A,>(node: NodeRecord<A>): void => {
  const mut_node = asMutable(node);

  // A completed node is reached again through every parent that completes
  // after it; running again would repeat the teardown and the unregistering.
  if (mut_node.isCompleted) {
    return;
  }

  if (mut_node.teardowns !== undefined) {
    for (const teardown of mut_node.teardowns) {
      teardown();
    }
  }

  completeBase(mut_node);

  if (!mut_node.isRegistered) {
    return;
  }

  mut_node.isRegistered = false;

  unregisterChild(mut_node);
};

/**
 * Called by a parent that has completed. A root has no parents, and a child
 * completing never completes it (#2133), so only its own `complete()` ends
 * it.
 */
export const tryComplete = <A,>(node: NodeRecord<A>): void => {
  const mut_node = asMutable(node);

  if (mut_node.isCompleted || mut_node.parents === undefined) {
    return;
  }

  // No live parent is left, or no value can come from the live ones.
  if (
    mut_node.parents.every((p) => p.isCompleted) ||
    mut_node.canEmitNoMore?.() === true
  ) {
    completeNode(mut_node);
  }
};

/**
 * Registers a child to its parents and to the managers it is reached from.
 * Runs after `init`, so a child that `init` completed is never registered.
 */
export const registerChild = <A,>(child: NodeRecord<A>): void => {
  const mut_child = asMutable(child);

  const parents = mut_child.parents ?? ([] as const);

  for (const p of parents) {
    addChild(toRecord(p), mut_child);
  }

  for (const m of upstreamManagersOf(mut_child)) {
    addDescendant(m, mut_child);
  }

  mut_child.isRegistered = true;
};

/** The public view of a record; the record is the observable. */
export const toPublic = <A,>(node: NodeRecord<A>): Observable<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  node as unknown as Observable<A>;

/**
 * Whether some observable's update is propagating right now. A root written
 * to while one is, is written to from inside a subscriber or a projection
 * (#2336).
 */
export const isPropagating = (): boolean => mut_propagation.depth > 0;

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

/** Default `tryUpdate` for observables that never receive parent updates. */
export const createTryUpdateNotImplemented = (): ((
  _updateToken: UpdateToken,
) => void) => tryUpdateNotImplemented;

/* implementation */

/** How many `startUpdate` calls are running, across every observable. */
const mut_propagation = { depth: 0 };

/**
 * Work deferred by {@link runAfterPropagation}, run once the outermost
 * `startUpdate` has reached every descendant.
 */
const mut_afterPropagation: (() => void)[] = [];

const flushAfterPropagation = (): void => {
  // A deferred task may start an update of its own, which flushes what that
  // update defers before this loop moves on.
  while (Arr.isNonEmpty(mut_afterPropagation)) {
    mut_afterPropagation.shift()?.();
  }
};

export const tryUpdateNotImplemented = (_updateToken: UpdateToken): void => {
  // Not `todo()`: nothing here is waiting to be written. Every observable that
  // can receive a parent update supplies its own `tryUpdate`; an observable
  // with no parents never gets one. Reaching this is the invariant breaking,
  // which is what `unreachable` says (Sumi D-48).
  unreachable();
};

export const subscribe = <A,>(
  node: NodeRecord<A>,
  onNext: (v: A) => void,
  onComplete: (() => void) | undefined,
): Subscription => {
  const mut_node = asMutable(node);

  // first emit
  if (Optional.isSome(mut_node.snapshot)) {
    onNext(mut_node.snapshot.value);
  }

  if (mut_node.isCompleted) {
    onComplete?.();

    return noopSubscription;
  }

  const subscriber = toSubscriber(onNext, onComplete);

  mut_node.subscribers ??= new Set();

  mut_node.subscribers.add(subscriber);

  mut_node.hasSubscriber = true;

  return {
    unsubscribe: () => {
      if (mut_node.subscribers === undefined) {
        return;
      }

      mut_node.subscribers.delete(subscriber);

      mut_node.hasSubscriber = mut_node.subscribers.size > 0;
    },
  };
};

const noopSubscription: Subscription = { unsubscribe: () => {} } as const;

/**
 * Marks the node completed exactly once, releases it from its scope,
 * notifies and removes all subscribers, and lets its children decide whether
 * they complete too.
 */
const completeBase = <A,>(node: NodeRecord<A>): void => {
  const mut_node = asMutable(node);

  mut_node.isCompleted = true;

  if (mut_node.releaseFromScope !== undefined) {
    mut_node.releaseFromScope();

    mut_node.releaseFromScope = undefined;
  }

  if (mut_node.subscribers !== undefined) {
    for (const s of mut_node.subscribers) {
      s.onComplete();
    }

    mut_node.subscribers.clear();
  }

  mut_node.hasSubscriber = false;

  // A child that completes removes itself from `children` during this loop,
  // which iterating a `Set` tolerates.
  if (mut_node.children !== undefined) {
    for (const c of mut_node.children) {
      tryComplete(c);
    }
  }
};

const addChild = <A,>(
  node: NodeRecord<A>,
  child: NodeRecord<unknown>,
): void => {
  const mut_node = asMutable(node);

  // A set, not an array: a completed child removes itself, and that has to
  // be O(1) for a UI that creates and completes derived nodes on every mount.
  if (mut_node.children === undefined) {
    mut_node.children = new Set([child]);
  } else {
    mut_node.children.add(child);
  }

  mut_node.hasChild = true;
};

const deleteChild = <A,>(
  node: NodeRecord<A>,
  child: NodeRecord<unknown>,
): void => {
  const mut_node = asMutable(node);

  if (mut_node.children === undefined) {
    return;
  }

  mut_node.children.delete(child);

  mut_node.hasChild = mut_node.children.size > 0;
};

const addDescendant = (
  manager: NodeRecord<unknown>,
  child: NodeRecord<unknown>,
): void => {
  const mut_manager = asMutable(manager);

  const descendants = mut_manager.descendants;

  if (descendants === undefined) {
    return;
  }

  const index = child.depth - manager.depth - 1;

  const mut_bucket = descendants[index];

  if (mut_bucket === undefined) {
    // The first node of its depth: rare, so the array is copied rather than
    // written, which also leaves a walk already under way on the old one.
    mut_manager.descendants = Array.from(
      { length: Math.max(descendants.length, index + 1) },
      (_, i) => (i === index ? new Set([child]) : descendants[i]),
    );
  } else {
    mut_bucket.add(child);
  }

  if (!mut_manager.isPropagating) {
    return;
  }

  mut_manager.joinedDuringUpdate ??= new Set();

  mut_manager.joinedDuringUpdate.add(child);
};

const deleteDescendant = (
  manager: NodeRecord<unknown>,
  child: NodeRecord<unknown>,
): void => {
  // An emptied set stays, to be reused by the next node of its depth.
  const mut_bucket =
    asMutable(manager).descendants?.[child.depth - manager.depth - 1];

  mut_bucket?.delete(child);
};

/**
 * Runs `tryUpdate` on the descendants of `node`, shallowest first, skipping
 * those registered after this update began (see `ManagerState`).
 */
const propagate = <A,>(node: NodeRecord<A>, updateToken: UpdateToken): void => {
  const descendants = node.descendants;

  if (descendants === undefined) {
    return;
  }

  for (const bucket of descendants) {
    if (bucket !== undefined) {
      for (const c of bucket) {
        // Read for each node, since the set is made when the first joins.
        const joined = node.joinedDuringUpdate;

        if (joined?.has(c) !== true) {
          c.tryUpdate(updateToken);
        }
      }
    }
  }
};

/**
 * Undoes {@link registerChild} for a completed child: its parents forget it,
 * and every manager it registered to stops propagating updates to it.
 * Without this a completed node stayed reachable for as long as its root
 * lived, and ran its `tryUpdate` on every update (#2134).
 */
const unregisterChild = <A,>(child: NodeRecord<A>): void => {
  for (const p of child.parents ?? []) {
    deleteChild(toRecord(p), child);
  }

  for (const m of upstreamManagersOf(child)) {
    deleteDescendant(m, child);
  }
};

/** The managers a child registers to: those its parents' descendants do. */
const upstreamManagersOf = <A,>(
  child: NodeRecord<A>,
): readonly NodeRecord<unknown>[] =>
  child.kind === 'sync child'
    ? child.managers
    : managersOf(child.parents ?? []);

/**
 * The managers the descendants of `parents` register to, shared with the
 * parent when there is one.
 */
export const managersOf = (
  parents: readonly Observable<unknown>[],
): readonly NodeRecord<unknown>[] =>
  Arr.isFixedLengthArray(1, parents)
    ? toRecord(parents[0]).managers
    : Array.from(new Set(parents.flatMap((p) => toRecord(p).managers)));
