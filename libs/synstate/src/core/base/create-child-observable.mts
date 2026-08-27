import { Arr, type Optional, type Some } from 'ts-data-forge';
import { type MutableSet } from 'ts-type-forge';
import {
  isChildObservable,
  isManagerObservable,
  type AsyncChildObservable,
  type ChildObservable,
  type InitializedSyncChildObservable,
  type NonEmptyUnknownList,
  type Observable,
  type ObservableId,
  type SyncChildObservable,
  type UpdateToken,
  type Wrap,
} from '../types/index.mjs';
import { binarySearch, issueUpdateToken, maxDepth } from '../utils/index.mjs';
import {
  assembleObservable,
  createObservableBaseHandle,
  tryUpdateNotImplemented,
} from './create-observable-base.mjs';

/**
 * The internal tools a sync-child leaf factory (`map`, `filter`, `zip`, …)
 * receives — the replacement for the `protected` methods a subclass of
 * `SyncChildObservableClass` used to inherit.
 */
export type SyncChildObservableTools<A> = Readonly<{
  /** Emits `nextValue` under `updateToken` and notifies subscribers. */
  setNext: (nextValue: A, updateToken: UpdateToken) => void;

  getSnapshot: () => Optional<A>;

  /** Completes this observable (leaf teardown included). */
  complete: () => void;
}>;

/**
 * The internal tools an async-child leaf factory (`debounce`, `switchMap`, …)
 * receives. Async children additionally start their own update propagation.
 */
export type AsyncChildObservableTools<A> = Readonly<{
  /** Emits `nextValue` and propagates the update to all descendants. */
  startUpdate: (nextValue: A) => void;
}> &
  SyncChildObservableTools<A>;

export type ChildObservableConfig<A, P extends NonEmptyUnknownList> = Readonly<{
  parents: Wrap<P>;

  depth?: number;

  initialValue: Optional<A>;

  /**
   * Leaf teardown (clear timers, unsubscribe inner observables, …), run at
   * the beginning of `complete()` — the closure replacement for
   * `override complete() { teardown(); super.complete(); }`.
   */
  onComplete?: () => void;
}>;

/**
 * Creates a sync-child observable — the classless replacement for extending
 * `SyncChildObservableClass`.
 *
 * `createTryUpdate` receives the internal tools and returns the `tryUpdate`
 * implementation (the former `override tryUpdate`). It runs during
 * construction, before the observable is registered to its parents; leaf
 * state can live either in the enclosing factory scope or inside the
 * `createTryUpdate` closure.
 */
export const createSyncChildObservable = <A, P extends NonEmptyUnknownList>(
  {
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
    onComplete,
  }: ChildObservableConfig<A, P>,
  createTryUpdate?: (
    tools: SyncChildObservableTools<A>,
  ) => (updateToken: UpdateToken) => void,
): SyncChildObservable<A, P> => {
  const handle = createObservableBaseHandle<A>(initialValue);

  const complete = (): void => {
    onComplete?.();

    handle.completeBase();

    // propagate to parents
    for (const par of parents) {
      par.tryComplete();
    }
  };

  const tryComplete = (): void => {
    tryCompleteChild({
      hasSubscriber: handle.hasSubscriber(),
      hasActiveChild: handle.hasActiveChild(),
      parents,
      complete,
    });
  };

  const tryUpdate =
    createTryUpdate?.({
      setNext: handle.setNext,
      getSnapshot: handle.getSnapshot,
      complete,
    }) ?? tryUpdateNotImplemented;

  const observable: SyncChildObservable<A, P> = assembleObservable({
    kind: 'sync child',
    depth,
    handle,
    tryUpdate,
    tryComplete,
    complete,
    extra: { parents },
  });

  registerChild(observable, parents);

  return observable;
};

/**
 * Creates a sync-child observable that always holds a value.
 *
 * Runtime-wise this is exactly `createSyncChildObservable`; only the types of
 * `getSnapshot` and `pipe` are narrowed, which is what the
 * `InitializedSyncChildObservableClass` overrides existed for.
 */
export const createInitializedSyncChildObservable = <
  A,
  P extends NonEmptyUnknownList,
>(
  config: Readonly<{
    parents: Wrap<P>;

    depth?: number;

    initialValue: Some<A>;

    onComplete?: () => void;
  }>,
  createTryUpdate?: (
    tools: SyncChildObservableTools<A>,
  ) => (updateToken: UpdateToken) => void,
): InitializedSyncChildObservable<A, P> => {
  const observable = createSyncChildObservable<A, P>(config, createTryUpdate);

  return (
    // `getSnapshot` always returns `Some` here: `initialValue` is a `Some` and
    // `setNext` only ever stores a `Some`.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    observable as InitializedSyncChildObservable<A, P>
  );
};

/**
 * Creates an async-child observable — the classless replacement for extending
 * `AsyncChildObservableClass`. See {@link createSyncChildObservable} for the
 * `createTryUpdate` contract.
 */
export const createAsyncChildObservable = <A, P extends NonEmptyUnknownList>(
  {
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
    onComplete,
  }: ChildObservableConfig<A, P>,
  createTryUpdate?: (
    tools: AsyncChildObservableTools<A>,
  ) => (updateToken: UpdateToken) => void,
): AsyncChildObservable<A, P> => {
  const handle = createObservableBaseHandle<A>(initialValue);

  let mut_propagationOrder: readonly ChildObservable<unknown>[] = [];

  const mut_descendantsIdSet: MutableSet<ObservableId> = new Set();

  const addDescendant = <B,>(child: ChildObservable<B>): void => {
    if (mut_descendantsIdSet.has(child.id)) return;

    mut_descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      mut_propagationOrder.map((a) => a.depth),
      child.depth,
    );

    mut_propagationOrder = Arr.toInserted(
      mut_propagationOrder,
      insertPos,
      child,
    );
  };

  const startUpdate = (nextValue: A): void => {
    const updateToken = issueUpdateToken();

    handle.setNext(nextValue, updateToken);

    for (const p of mut_propagationOrder) {
      p.tryUpdate(updateToken);
    }
  };

  const complete = (): void => {
    onComplete?.();

    handle.completeBase();

    // propagate to parents
    for (const par of parents) {
      par.tryComplete();
    }
  };

  const tryComplete = (): void => {
    tryCompleteChild({
      hasSubscriber: handle.hasSubscriber(),
      hasActiveChild: handle.hasActiveChild(),
      parents,
      complete,
    });
  };

  const tryUpdate =
    createTryUpdate?.({
      setNext: handle.setNext,
      getSnapshot: handle.getSnapshot,
      complete,
      startUpdate,
    }) ?? tryUpdateNotImplemented;

  const observable: AsyncChildObservable<A, P> = assembleObservable({
    kind: 'async child',
    depth,
    handle,
    tryUpdate,
    tryComplete,
    complete,
    extra: { parents, addDescendant },
  });

  registerChild(observable, parents);

  return observable;
};

/* helpers */

/**
 * Detects circular dependencies by walking the full ancestor chain of the
 * given parents and checking whether `child` already appears among them.
 *
 * @throws {Error} if a circular dependency is detected
 */
const hasCircularDependencyFrom = (
  node: Observable<unknown>,
  mut_visited: MutableSet<ObservableId>,
  mut_inPath: MutableSet<ObservableId>,
): boolean => {
  if (mut_inPath.has(node.id)) return true;

  if (mut_visited.has(node.id)) return false;

  mut_visited.add(node.id);

  mut_inPath.add(node.id);

  if (isChildObservable(node)) {
    for (const parent of node.parents) {
      if (hasCircularDependencyFrom(parent, mut_visited, mut_inPath)) {
        return true;
      }
    }
  }

  mut_inPath.delete(node.id);

  return false;
};

const detectCircularDependency = (
  child: ChildObservable<unknown>,
  parents: readonly Observable<unknown>[],
): void => {
  const mut_visited = new Set<ObservableId>();

  const mut_inPath = new Set<ObservableId>([child.id]);

  for (const parent of parents) {
    if (hasCircularDependencyFrom(parent, mut_visited, mut_inPath)) {
      throw new Error(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    }
  }
};

/**
 * Registers `child` to its parents and to all reachable manager observables.
 * Runs after the child object is fully assembled, so parents only ever hold a
 * reference to the final composed object (the class version registered `this`
 * from inside the constructor instead).
 */
const registerChild = <A,>(
  child: ChildObservable<A>,
  parents: ChildObservable<A>['parents'],
): void => {
  detectCircularDependency(child, parents);

  for (const p of parents) {
    p.addChild(child);
  }

  // register child to all reachable ManagerObservables
  const mut_rest = Array.from(parents);

  while (Arr.isNonEmpty(mut_rest)) {
    const p = mut_rest.pop();

    if (p === undefined) break;

    if (isManagerObservable(p)) {
      p.addDescendant(child);
    } else {
      // trace back dependency graph
      mut_rest.push(...p.parents);
    }
  }
};

const tryCompleteChild = <A,>({
  hasSubscriber,
  hasActiveChild,
  parents,
  complete,
}: Readonly<{
  hasSubscriber: boolean;
  hasActiveChild: boolean;
  parents: ChildObservable<A>['parents'];
  complete: () => void;
}>): void => {
  // If there is no working parent node
  if (parents.every((r) => r.isCompleted)) {
    complete();

    return;
  }

  // If there are no active child node
  if (!hasSubscriber && !hasActiveChild) {
    complete();
  }

  // propagate to parents
  for (const par of parents) {
    par.tryComplete();
  }
};
