import { hasKey, isRecord, type Optional, type Some } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type { MutableSet } from 'ts-type-forge';
import type {
  AsyncChildObservable,
  InitializedSyncChildObservable,
  NonEmptyUnknownList,
  Observable,
  SyncChildObservable,
  UpdateToken,
  Wrap,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';
import {
  addTeardown,
  adoptIntoCurrentScope,
  completeNode,
  registerChild,
  runAfterPropagation,
  setNext,
  startUpdate,
  toPublic,
} from './create-observable-base.mjs';
import { createNodeRecord } from './node-class.mjs';
import { asMutable, type NodeRecord } from './observable-node.mjs';

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
  const node = createNodeRecord<A>('sync child', depth, parents, initialValue);

  const hooks = toHooks(
    init({
      setNext: (nextValue, updateToken) => {
        setNext(node, nextValue, updateToken);
      },
      getSnapshot: () => node.snapshot,
      complete: () => {
        completeNode(node);
      },
      completeAfterPropagation: () => {
        runAfterPropagation(() => {
          completeNode(node);
        });
      },
      onComplete: (teardown) => {
        addTeardown(node, teardown);
      },
    }),
  );

  return finishChild(node, hooks);
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
  const node = createNodeRecord<A>('async child', depth, parents, initialValue);

  const hooks = toHooks(
    init({
      setNext: (nextValue, updateToken) => {
        setNext(node, nextValue, updateToken);
      },
      startUpdate: (nextValue) => {
        startUpdate(node, nextValue);
      },
      getSnapshot: () => node.snapshot,
      complete: () => {
        completeNode(node);
      },
      completeAfterPropagation: () => {
        runAfterPropagation(() => {
          completeNode(node);
        });
      },
      onComplete: (teardown) => {
        addTeardown(node, teardown);
      },
    }),
  );

  return finishChild(node, hooks);
};

/* helpers */

const isDevelopmentProcess = (): boolean => {
  const proc: unknown = Reflect.get(globalThis, 'process');

  return (
    isRecord(proc) &&
    hasKey(proc, 'env') &&
    isRecord(proc.env) &&
    (!hasKey(proc.env, 'NODE_ENV') || proc.env.NODE_ENV !== 'production')
  );
};

/** `init` may return `tryUpdate` alone, or it with the other hooks. */
const toHooks = (
  returned: ((updateToken: UpdateToken) => void) | AsyncChildObservableHooks,
): AsyncChildObservableHooks =>
  typeof returned === 'function'
    ? ({ tryUpdate: returned } as const)
    : returned;

/**
 * Whether {@link registerChild} checks for a circular dependency: everywhere
 * but in a process whose `NODE_ENV` is `production`. A child's parents exist
 * before it and cannot be changed afterwards, so only code that rewrites an
 * observable's readonly `parents` can make a cycle, while the walk over every
 * ancestor is paid on every creation. Where there is no `process` (a browser
 * bundle) the check is off.
 */
const checksCircularDependency: boolean = isDevelopmentProcess();

/**
 * Detects circular dependencies by walking the full ancestor chain of the
 * given parents and checking whether `child` already appears among them.
 *
 * @throws {Error} if a circular dependency is detected
 */
const hasCircularDependencyFrom = (
  node: Observable<unknown>,
  mut_visited: MutableSet<Observable<unknown>>,
  mut_inPath: MutableSet<Observable<unknown>>,
): boolean => {
  if (mut_inPath.has(node)) {
    return true;
  }

  if (mut_visited.has(node)) {
    return false;
  }

  mut_visited.add(node);

  mut_inPath.add(node);

  if (node.kind !== 'root') {
    for (const parent of node.parents) {
      if (hasCircularDependencyFrom(parent, mut_visited, mut_inPath)) {
        return true;
      }
    }
  }

  mut_inPath.delete(node);

  return false;
};

const detectCircularDependency = <A,>(
  child: NodeRecord<A>,
  parents: readonly Observable<unknown>[],
): void => {
  const mut_visited = new Set<Observable<unknown>>();

  const mut_inPath = new Set<Observable<unknown>>([toPublic(child)]);

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
 * Installs the hooks `init` returned, joins the current scope, and registers
 * the child. Completed parents never update again, so a child created under
 * them is complete from the start (#2248), as is one `init` completed;
 * registering it would only leave a reference in each parent.
 */
const finishChild = <A, R>(
  node: NodeRecord<A>,
  hooks: AsyncChildObservableHooks,
): R => {
  const mut_node = asMutable(node);

  mut_node.tryUpdate = hooks.tryUpdate;

  mut_node.canEmitNoMore = hooks.canEmitNoMore;

  mut_node.flush = hooks.flush;

  adoptIntoCurrentScope(mut_node);

  const parents = mut_node.parents ?? ([] as const);

  if (mut_node.isCompleted || parents.every((p) => p.isCompleted)) {
    completeNode(node);
  } else {
    if (checksCircularDependency) {
      detectCircularDependency(mut_node, parents);
    }

    registerChild(mut_node);
  }

  return (
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    mut_node as unknown as R
  );
};
