import { Arr, type Optional, type Some } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type { MutableSet } from 'ts-type-forge';
import type {
  AsyncChildObservable,
  InitializedSyncChildObservable,
  NonEmptyUnknownList,
  Observable,
  ObservableId,
  SyncChildObservable,
  UpdateToken,
  Wrap,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';
import {
  assembleObservable,
  createManagerObservableParts,
  createObservableBaseHandle,
  createTeardownList,
  runAfterPropagation,
} from './create-observable-base.mjs';
import {
  toNode,
  type AsyncChildObservableNode,
  type ChildObservableNode,
  type SyncChildObservableNode,
} from './observable-node.mjs';

/**
 * The tools a sync-child factory (`map`, `filter`, `zip`, …) receives: what
 * only the observable being created may do to itself.
 */
export type SyncChildObservableTools<A> = Readonly<{
  /** Emits `nextValue` under `updateToken` and notifies subscribers. */
  setNext: (nextValue: A, updateToken: UpdateToken) => void;

  getSnapshot: () => Optional<A>;

  /** Completes this observable (leaf teardown included). */
  complete: () => void;

  /**
   * Completes this observable once the update now propagating has reached
   * every descendant, so that they see the value just passed on first.
   */
  completeAfterPropagation: () => void;

  /**
   * Registers a teardown (clear timers, unsubscribe inner observables, …) to
   * run when this observable completes or is disposed, in the order
   * registered. Called from `init`, it lets the teardown close over what
   * `init` creates. Registered once the observable has completed, the
   * teardown runs at once.
   */
  onComplete: (teardown: () => void) => void;
}>;

/**
 * The tools an async-child factory (`debounce`, `switchMap`, …) receives.
 * Async children additionally start their own update propagation.
 */
export type AsyncChildObservableTools<A> = Readonly<{
  /** Emits `nextValue` and propagates the update to all descendants. */
  startUpdate: (nextValue: A) => void;
}> &
  SyncChildObservableTools<A>;

/**
 * What a sync child's `init` may return instead of `tryUpdate` alone: the
 * hooks the factory calls, which read the state `init` creates.
 */
export type SyncChildObservableHooks = Readonly<{
  /** Called with the token of every update that reaches this observable. */
  tryUpdate: (updateToken: UpdateToken) => void;

  /**
   * Whether this observable can emit nothing more although some parent is
   * still live, asked whenever a parent completes. `true` completes it then,
   * as all parents completing does (`zip` once a completed source's queue is
   * empty).
   */
  canEmitNoMore?: () => boolean;
}>;

/**
 * What an async child's `init` may return instead of `tryUpdate` alone. An
 * async child can also hold a value it has not passed on yet (`debounce`'s
 * pending value), which completing should not lose.
 */
export type AsyncChildObservableHooks = SyncChildObservableHooks &
  Readonly<{
    /**
     * Run at the beginning of `complete()`, before the teardowns, and never
     * by `dispose()`: passes on what this observable still holds through
     * `startUpdate`, so that its subscribers see it before they see the
     * completion. A disposed observable has no one left to tell.
     */
    flush?: () => void;
  }>;

type ChildObservableConfigBase<P extends NonEmptyUnknownList> = Readonly<{
  parents: Wrap<P>;

  /**
   * Defaults to one more than the deepest parent. An update reaches
   * observables in ascending depth, so an observable `tryUpdate` reads with
   * `getSnapshot` without being its child (`withCurrentValueFrom`'s second
   * source) has to be shallower than this one too, or this one reads its value
   * from before the update: pass `1 + Math.max(...)` over both then.
   */
  depth?: number;
}>;

export type ChildObservableConfig<
  A,
  P extends NonEmptyUnknownList,
> = ChildObservableConfigBase<P> &
  Readonly<{
    initialValue: Optional<A>;
  }>;

export type InitializedChildObservableConfig<
  A,
  P extends NonEmptyUnknownList,
> = ChildObservableConfigBase<P> &
  Readonly<{
    initialValue: Some<A>;
  }>;

/**
 * Creates a sync-child observable: one derived from `parents` that emits, if
 * at all, in the same update as they do. `map`, `filter`, `combine` and the
 * other synchronous operators are built with it.
 *
 * `init` runs during construction and receives the tools. It returns
 * `tryUpdate`, which is called with the token of every update that reaches
 * this observable — a parent that did not emit in that update has a different
 * `updateToken`; to emit, call `setNext` with the token received — or an
 * object holding `tryUpdate` and the other hooks
 * ({@link SyncChildObservableHooks}). State the hooks share can live inside
 * `init`, next to the teardown it registers with the `onComplete` tool.
 * `init` may complete the observable; it is then never registered to its
 * parents.
 *
 * @example
 *
 * ```ts
 * // A custom operator, written as `map((x) => x * 2)` is.
 * const double = (src: Observable<number>): Observable<number> =>
 *   createSyncChildObservable(
 *     { parents: [src], initialValue: Optional.none },
 *     ({ setNext }) =>
 *       (updateToken) => {
 *         const sn = src.getSnapshot();
 *
 *         if (src.updateToken !== updateToken || Optional.isNone(sn)) {
 *           return; // `src` did not emit in this update
 *         }
 *
 *         setNext(sn.value * 2, updateToken);
 *       },
 *   );
 *
 * const num$ = source<number>();
 *
 * const pair$ = combine([num$, double(num$)]);
 *
 * const valueHistory: FixedLengthTuple<2, number>[] = [];
 *
 * pair$.subscribe((pair) => {
 *   valueHistory.push(pair);
 * });
 *
 * num$.next(1);
 *
 * num$.next(2);
 *
 * // `double` joins the same update as `num$`, so `combine` sees no [2, 2].
 * assert.deepStrictEqual(valueHistory, [
 *   [1, 2],
 *   [2, 4],
 * ]);
 * ```
 */
export const createSyncChildObservable = <A, P extends NonEmptyUnknownList>(
  {
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: ChildObservableConfig<A, P>,
  init: (
    tools: SyncChildObservableTools<A>,
  ) => ((updateToken: UpdateToken) => void) | SyncChildObservableHooks,
): SyncChildObservable<A, P> => {
  const handle = createObservableBaseHandle<A>(initialValue);

  const teardowns = createTeardownList(handle.isCompleted);

  /** Set once assembled; see {@link unregisterChild}. */
  let mut_self: ChildObservableNode<A> | undefined = undefined;

  /** Set once `init` returns; see {@link SyncChildObservableHooks}. */
  let mut_canEmitNoMore: (() => boolean) | undefined = undefined;

  // Completing never reaches the parents: an upstream observable may be
  // shared, and only whoever owns it decides when it ends (#2133).
  const complete = (): void => {
    // A completed node is reached again through every parent that completes
    // after it; running again would repeat the teardown and the ancestor walk
    // in `unregisterChild`.
    if (handle.isCompleted()) {
      return;
    }

    teardowns.runAll();

    handle.completeBase();

    if (mut_self !== undefined) {
      unregisterChild(mut_self, parents);
    }
  };

  // Called by a parent that has completed.
  const tryComplete = (): void => {
    if (handle.isCompleted()) {
      return;
    }

    // No live parent is left, or no value can come from the live ones.
    if (parents.every((p) => p.isCompleted) || mut_canEmitNoMore?.() === true) {
      complete();
    }
  };

  const hooks = toHooks(
    init({
      setNext: handle.setNext,
      getSnapshot: handle.getSnapshot,
      complete,
      completeAfterPropagation: () => {
        runAfterPropagation(complete);
      },
      onComplete: teardowns.add,
    }),
  );

  mut_canEmitNoMore = hooks.canEmitNoMore;

  const observable: SyncChildObservableNode<A, P> = assembleObservable({
    kind: 'sync child',
    depth,
    handle,
    tryUpdate: hooks.tryUpdate,
    tryComplete,
    complete,
    dispose: complete,
    extra: { parents },
  });

  // Completed parents never update again, so a child created under them is
  // complete from the start (#2248), as is one `init` completed; registering
  // it would only leave a reference in each parent.
  if (handle.isCompleted() || parents.every((p) => p.isCompleted)) {
    complete();
  } else {
    registerChild(observable, parents);

    mut_self = observable;
  }

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
  config: InitializedChildObservableConfig<A, P>,
  init: (
    tools: SyncChildObservableTools<A>,
  ) => ((updateToken: UpdateToken) => void) | SyncChildObservableHooks,
): InitializedSyncChildObservable<A, P> => {
  const observable = createSyncChildObservable<A, P>(config, init);

  return (
    // `getSnapshot` always returns `Some` here: `initialValue` is a `Some` and
    // `setNext` only ever stores a `Some`.
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    observable as InitializedSyncChildObservable<A, P>
  );
};

/**
 * Creates an async-child observable: one derived from `parents` that may emit
 * later, in an update of its own, through `startUpdate` (`debounce`,
 * `switchMap`). It may also emit synchronously with `setNext`, as a sync child
 * does. See {@link createSyncChildObservable} for the `init` contract; an
 * async child's `init` may also return a `flush` hook
 * ({@link AsyncChildObservableHooks}).
 */
export const createAsyncChildObservable = <A, P extends NonEmptyUnknownList>(
  {
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: ChildObservableConfig<A, P>,
  init: (
    tools: AsyncChildObservableTools<A>,
  ) => ((updateToken: UpdateToken) => void) | AsyncChildObservableHooks,
): AsyncChildObservable<A, P> => {
  const handle = createObservableBaseHandle<A>(initialValue);

  const { addDescendant, deleteDescendant, startUpdate } =
    createManagerObservableParts(handle);

  const teardowns = createTeardownList(handle.isCompleted);

  /** Set once assembled; see {@link unregisterChild}. */
  let mut_self: ChildObservableNode<A> | undefined = undefined;

  /** Set once `init` returns; see {@link AsyncChildObservableHooks}. */
  let mut_hooks: AsyncChildObservableHooks | undefined = undefined;

  // Neither this nor `complete` reaches the parents: an upstream observable
  // may be shared, and only whoever owns it decides when it ends (#2133).
  const dispose = (): void => {
    // A completed node is reached again through every parent that completes
    // after it; running again would repeat the teardown and the ancestor walk
    // in `unregisterChild`.
    if (handle.isCompleted()) {
      return;
    }

    teardowns.runAll();

    handle.completeBase();

    if (mut_self !== undefined) {
      unregisterChild(mut_self, parents);
    }
  };

  // Unlike `dispose`, passes on what this observable still holds first.
  const complete = (): void => {
    if (handle.isCompleted()) {
      return;
    }

    mut_hooks?.flush?.();

    dispose();
  };

  // Called by a parent that has completed.
  const tryComplete = (): void => {
    if (handle.isCompleted()) {
      return;
    }

    // No live parent is left, or no value can come from the live ones.
    if (
      parents.every((p) => p.isCompleted) ||
      mut_hooks?.canEmitNoMore?.() === true
    ) {
      complete();
    }
  };

  const hooks = toHooks(
    init({
      setNext: handle.setNext,
      getSnapshot: handle.getSnapshot,
      complete,
      completeAfterPropagation: () => {
        runAfterPropagation(complete);
      },
      onComplete: teardowns.add,
      startUpdate,
    }),
  );

  mut_hooks = hooks;

  const observable: AsyncChildObservableNode<A, P> = assembleObservable({
    kind: 'async child',
    depth,
    handle,
    tryUpdate: hooks.tryUpdate,
    tryComplete,
    complete,
    dispose,
    extra: { parents, addDescendant, deleteDescendant },
  });

  // Completed parents never update again, so a child created under them is
  // complete from the start (#2248), as is one `init` completed; registering
  // it would only leave a reference in each parent.
  if (handle.isCompleted() || parents.every((p) => p.isCompleted)) {
    complete();
  } else {
    registerChild(observable, parents);

    mut_self = observable;
  }

  return observable;
};

/* helpers */

/** `init` may return `tryUpdate` alone, or it with the other hooks. */
const toHooks = (
  returned: ((updateToken: UpdateToken) => void) | AsyncChildObservableHooks,
): AsyncChildObservableHooks =>
  typeof returned === 'function'
    ? ({ tryUpdate: returned } as const)
    : returned;

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
  if (mut_inPath.has(node.id)) {
    return true;
  }

  if (mut_visited.has(node.id)) {
    return false;
  }

  mut_visited.add(node.id);

  mut_inPath.add(node.id);

  if (node.kind !== 'root') {
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
  child: ChildObservableNode<unknown>,
  parents: readonly Observable<unknown>[],
): void => {
  const mut_visited = new Set<ObservableId>();

  const mut_inPath = new Set<ObservableId>([child.id]);

  for (const parent of parents) {
    if (hasCircularDependencyFrom(parent, mut_visited, mut_inPath)) {
      // A programming error (invariant violation), not a recoverable
      // failure. `panic` marks the error it throws, so the `Result` /
      // `AsyncResult` boundaries rethrow it rather than turning an invariant
      // violation into an `Err` a caller might handle (Sumi D-48 / D-53).
      panic(
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
  child: ChildObservableNode<A>,
  parents: readonly Observable<unknown>[],
): void => {
  detectCircularDependency(child, parents);

  for (const p of parents) {
    toNode(p).addChild(child);
  }

  // register child to all reachable ManagerObservables
  const mut_rest = Array.from(parents);

  while (Arr.isNonEmpty(mut_rest)) {
    const popped = mut_rest.pop();

    if (popped === undefined) {
      break;
    }

    const p = toNode(popped);

    if (p.kind === 'sync child') {
      // trace back dependency graph
      mut_rest.push(...p.parents);
    } else {
      p.addDescendant(child);
    }
  }
};

/**
 * Undoes {@link registerChild} for a completed child: its parents forget it, and
 * every manager it registered to stops propagating updates to it. Without this
 * a completed node stayed reachable for as long as its root lived, and ran its
 * `tryUpdate` on every update (#2134).
 *
 * A completion that happens while the child is still being constructed (from
 * its `init`) precedes its registration, which is then skipped, so there is
 * nothing to undo; `mut_self` is still `undefined` then.
 */
const unregisterChild = <A,>(
  child: ChildObservableNode<A>,
  parents: readonly Observable<unknown>[],
): void => {
  for (const p of parents) {
    toNode(p).deleteChild(child);
  }

  const mut_rest = Array.from(parents);

  while (Arr.isNonEmpty(mut_rest)) {
    const popped = mut_rest.pop();

    if (popped === undefined) {
      break;
    }

    const p = toNode(popped);

    if (p.kind === 'sync child') {
      mut_rest.push(...p.parents);
    } else {
      p.deleteDescendant(child);
    }
  }
};
