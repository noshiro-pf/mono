// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Arr, type Optional, type Some } from 'ts-data-forge';
import { unreachable } from 'ts-std-forge';
import type {
  AsyncChildObservable,
  InitializedSyncChildObservable,
  NonEmptyUnknownList,
  SyncChildObservable,
  UpdateToken,
  Wrap,
} from '../types/index.mjs';
import {
  AsyncChildObservableClass,
  SyncChildObservableClass,
} from './child-observable-class.mjs';

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
  /**
   * Called with the token of every update in which a parent of this
   * observable emitted.
   */
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
 * `tryUpdate`, which is called with the token of every update in which some
 * parent of this observable emitted — a parent that did not emit in that
 * update has a different `updateToken`; to emit, call `setNext` with the
 * token received — or an object holding `tryUpdate` and the other hooks
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
  config: ChildObservableConfig<A, P>,
  init: (
    tools: SyncChildObservableTools<A>,
  ) => ((updateToken: UpdateToken) => void) | SyncChildObservableHooks,
): SyncChildObservable<A, P> =>
  new CustomSyncChildObservableClass(config, init);

/**
 * Creates a sync-child observable that always holds a value.
 *
 * Runtime-wise this is exactly `createSyncChildObservable`; only the types of
 * `getSnapshot` and `pipe` are narrowed.
 */
export const createInitializedSyncChildObservable = <
  A,
  P extends NonEmptyUnknownList,
>(
  config: InitializedChildObservableConfig<A, P>,
  init: (
    tools: SyncChildObservableTools<A>,
  ) => ((updateToken: UpdateToken) => void) | SyncChildObservableHooks,
): InitializedSyncChildObservable<A, P> =>
  // `getSnapshot` always returns `Some` here: `initialValue` is a `Some` and
  // `setNext` only ever stores a `Some`.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  new CustomSyncChildObservableClass<A, P>(
    config,
    init,
  ) as unknown as InitializedSyncChildObservable<A, P>;

/**
 * Creates an async-child observable: one derived from `parents` that may emit
 * later, in an update of its own, through `startUpdate` (`debounce`,
 * `switchMap`). It may also emit synchronously with `setNext`, as a sync child
 * does. See {@link createSyncChildObservable} for the `init` contract; an
 * async child's `init` may also return a `flush` hook
 * ({@link AsyncChildObservableHooks}).
 */
export const createAsyncChildObservable = <A, P extends NonEmptyUnknownList>(
  config: ChildObservableConfig<A, P>,
  init: (
    tools: AsyncChildObservableTools<A>,
  ) => ((updateToken: UpdateToken) => void) | AsyncChildObservableHooks,
): AsyncChildObservable<A, P> =>
  new CustomAsyncChildObservableClass(config, init);

/**
 * An `init` for a child that never receives a parent update; reaching its
 * `tryUpdate` is the invariant breaking (Sumi D-48).
 */
export const createTryUpdateNotImplemented = (): ((
  updateToken: UpdateToken,
) => void) => tryUpdateNotImplemented;

const tryUpdateNotImplemented = (): void => {
  unreachable();
};

/* implementation */

class CustomSyncChildObservableClass<
  A,
  const P extends NonEmptyUnknownList,
> extends SyncChildObservableClass<A, P> {
  #mut_teardowns: readonly (() => void)[] | undefined;
  readonly #hooks: SyncChildObservableHooks;

  constructor(
    config: ChildObservableConfig<A, P>,
    init: (
      tools: SyncChildObservableTools<A>,
    ) => ((updateToken: UpdateToken) => void) | SyncChildObservableHooks,
  ) {
    super(config);

    this.#mut_teardowns = undefined;

    this.#hooks = toHooks(
      init({
        setNext: (nextValue, updateToken) => {
          this.setNext(nextValue, updateToken);
        },
        getSnapshot: () => this.getSnapshot(),
        complete: () => {
          this.complete();
        },
        completeAfterPropagation: () => {
          this.completeAfterPropagation();
        },
        onComplete: (teardown) => {
          if (this.isCompleted) {
            teardown();
          } else {
            this.#mut_teardowns = Arr.toPushed(
              this.#mut_teardowns ?? [],
              teardown,
            );
          }
        },
      }),
    );

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    this.#hooks.tryUpdate(updateToken);
  }

  override canEmitNoMore(): boolean {
    return this.#hooks.canEmitNoMore?.() === true;
  }

  protected override teardown(): void {
    for (const teardown of this.#mut_teardowns ?? []) {
      teardown();
    }
  }
}

class CustomAsyncChildObservableClass<
  A,
  const P extends NonEmptyUnknownList,
> extends AsyncChildObservableClass<A, P> {
  #mut_teardowns: readonly (() => void)[] | undefined;
  readonly #hooks: AsyncChildObservableHooks;

  constructor(
    config: ChildObservableConfig<A, P>,
    init: (
      tools: AsyncChildObservableTools<A>,
    ) => ((updateToken: UpdateToken) => void) | AsyncChildObservableHooks,
  ) {
    super(config);

    this.#mut_teardowns = undefined;

    this.#hooks = toHooks(
      init({
        setNext: (nextValue, updateToken) => {
          this.setNext(nextValue, updateToken);
        },
        startUpdate: (nextValue) => {
          this.startUpdate(nextValue);
        },
        getSnapshot: () => this.getSnapshot(),
        complete: () => {
          this.complete();
        },
        completeAfterPropagation: () => {
          this.completeAfterPropagation();
        },
        onComplete: (teardown) => {
          if (this.isCompleted) {
            teardown();
          } else {
            this.#mut_teardowns = Arr.toPushed(
              this.#mut_teardowns ?? [],
              teardown,
            );
          }
        },
      }),
    );

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    this.#hooks.tryUpdate(updateToken);
  }

  override canEmitNoMore(): boolean {
    return this.#hooks.canEmitNoMore?.() === true;
  }

  protected override flush(): void {
    this.#hooks.flush?.();
  }

  protected override teardown(): void {
    for (const teardown of this.#mut_teardowns ?? []) {
      teardown();
    }
  }
}

/** `init` may return `tryUpdate` alone, or it with the other hooks. */
const toHooks = (
  returned: ((updateToken: UpdateToken) => void) | AsyncChildObservableHooks,
): AsyncChildObservableHooks =>
  typeof returned === 'function'
    ? ({ tryUpdate: returned } as const)
    : returned;
