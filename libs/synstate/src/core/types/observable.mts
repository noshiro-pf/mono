import {
  expectType,
  hasKey,
  isRecord,
  type Optional,
  type Some,
} from 'ts-data-forge';
import type { FixedLengthTuple, StrictOmit } from 'ts-type-forge';
import { observableBrand } from '../utils/index.mjs';
import type { ObservableId, UpdateToken } from './id.mjs';
import type { ObservableKind } from './observable-kind.mjs';
import type { NonEmptyUnknownList, Subscription } from './types.mjs';

/**
 * Inheritance
 *
 * ```txt
 * ObservableBase
 *   |
 *   +- SyncChildObservable    \                       \
 *   |                          +-- ChildObservable     \
 *   +- AsyncChildObservable   X                         +-- Observable
 *   |                          +-- ManagerObservable   /
 *   +- RootObservableType     /                       /
 * ```
 */

type CreateObservableType<A, Kind extends ObservableKind> = Readonly<{
  [observableBrand]: true;

  id: ObservableId;
  kind: Kind;

  /**
   * One more than the deepest observable this one is derived from; 0 for a
   * root. An update reaches observables in ascending depth, so every parent
   * has emitted before its child reads it.
   */
  depth: Kind extends 'root' ? 0 : number;

  getSnapshot: () => Optional<A>;
  isCompleted: boolean;

  /**
   * The token of the update in which this observable last emitted. A child's
   * `tryUpdate` receives the token of the update now propagating; a parent
   * whose token differs did not emit in it. The token is opaque: compare it,
   * store it, or pass it on to `setNext`.
   */
  updateToken: UpdateToken;

  complete: () => void;

  /**
   * Completes this observable and takes it out of the graph, for whoever owns
   * it (a scope) to release it. Neither this nor `complete()` reaches upstream:
   * a child completing never completes its parents, which may be shared
   * (#2133). Its descendants complete once none of their parents is live.
   * Unlike `complete()`, it passes on nothing the observable still holds: a
   * `debounce` or `audit` drops its pending value instead of emitting it.
   */
  dispose: () => void;
  subscribe: (onNext: (v: A) => void, onComplete?: () => void) => Subscription;

  pipe: PipeMethod<A>;
}>;

/** @internal */
type PipeMethod<A> = (<B>(
  operator: WithInitialValueOperator<A, B>,
) => InitializedObservable<B>) &
  (<B>(operator: DropInitialValueOperator<A, B>) => Observable<B>) &
  (<B>(operator: KeepInitialValueOperator<A, B>) => Observable<B>);

export type ObservableBase<A> = CreateObservableType<A, ObservableKind>;

/** @internal */
namespace ObservableTypeConverter {
  export type ToInitialized<
    A,
    O extends CreateObservableType<A, ObservableKind>,
  > = StrictOmit<O, 'pipe' | 'getSnapshot'> &
    Readonly<{
      getSnapshot: () => Some<A>;

      pipe: PipeMethodForInitialized<A>;
    }>;

  type PipeMethodForInitialized<A> = (<B>(
    operator: WithInitialValueOperator<A, B>,
  ) => InitializedObservable<B>) &
    (<B>(operator: DropInitialValueOperator<A, B>) => Observable<B>) &
    (<B>(operator: KeepInitialValueOperator<A, B>) => InitializedObservable<B>);

  export type ToChild<
    A,
    O extends CreateObservableType<A, ObservableKind>,
    P extends NonEmptyUnknownList = NonEmptyUnknownList,
  > = O &
    Readonly<{
      parents: Wrap<P>;
    }>;
}

export type SyncChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = ObservableTypeConverter.ToChild<
  A,
  CreateObservableType<A, 'sync child'>,
  P
>;

export type InitializedSyncChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = ObservableTypeConverter.ToInitialized<A, SyncChildObservable<A, P>>;

export type AsyncChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = ObservableTypeConverter.ToChild<
  A,
  CreateObservableType<A, 'async child'>,
  P
>;

export type InitializedAsyncChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = ObservableTypeConverter.ToInitialized<A, AsyncChildObservable<A, P>>;

export type ChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = AsyncChildObservable<A, P> | SyncChildObservable<A, P>;

export type RootObservable<A> = CreateObservableType<A, 'root'>;

export type InitializedRootObservable<A> =
  ObservableTypeConverter.ToInitialized<A, RootObservable<A>>;

export type Observable<A> =
  AsyncChildObservable<A> | RootObservable<A> | SyncChildObservable<A>;

export type InitializedObservable<A> =
  | InitializedAsyncChildObservable<A>
  | InitializedRootObservable<A>
  | InitializedSyncChildObservable<A>;

export type ManagerObservable<A> = AsyncChildObservable<A> | RootObservable<A>;

/* operator types */

/** Type of operator that converts Observable to InitializedObservable */
export type WithInitialValueOperator<A, B> = (
  src: Observable<A>,
) => InitializedObservable<B>;

/** Type of operator that converts Observable to non-initialized Observable */
export type DropInitialValueOperator<A, B> = (
  src: InitializedObservable<A> | Observable<A>,
) => Observable<B>;

/** Type of operator that preserves whether Observable has initial value */
export type KeepInitialValueOperator<A, B> = (
  src: InitializedObservable<A>,
) => InitializedObservable<B>;

export type Operator<A, B> =
  | WithInitialValueOperator<A, B>
  | DropInitialValueOperator<A, B>
  | KeepInitialValueOperator<A, B>;

/**
 * Tells an observable made by synstate from any other value, by the brand
 * every observable carries. Checking for a `subscribe` method instead would
 * also accept plain values that happen to have one.
 *
 * @example
 *
 * ```ts
 * const [count$] = createState(0);
 *
 * assert.isTrue(isObservable(count$));
 *
 * // A `subscribe` method alone does not make an observable.
 * assert.isFalse(isObservable({ subscribe: () => {} }));
 *
 * assert.isFalse(isObservable(0));
 * ```
 */
export const isObservable = (value: unknown): value is Observable<unknown> =>
  isRecord(value) && hasKey(value, observableBrand);

export const isManagerObservable = <A,>(
  obs: Observable<A>,
): obs is ManagerObservable<A> => obs.kind !== 'sync child';

export const isRootObservable = <A,>(
  obs: Observable<A>,
): obs is RootObservable<A> => obs.kind === 'root';

export const isChildObservable = <A,>(
  obs: Observable<A>,
): obs is ChildObservable<A> =>
  obs.kind === 'sync child' || obs.kind === 'async child';

export type ObservableValue<A> = A extends Observable<infer B> ? B : never;

export type Unwrap<A extends readonly Observable<unknown>[]> = Readonly<{
  [P in keyof A]: ObservableValue<A[P]>;
}>;

export type Wrap<A extends readonly unknown[]> = Readonly<{
  [P in keyof A]: Observable<A[P]>;
}>;

export type WrapInitialized<A extends readonly unknown[]> = Readonly<{
  [P in keyof A]: InitializedObservable<A[P]>;
}>;

// type GetDestTypeOfOperator<Op extends Operator<unknown, unknown>> =
//   Op extends Operator<unknown, infer B> ? B : never;

// Only the members meant for users are public; the rest live on the
// internal node types in `core/base` (#2117).
expectType<
  keyof Observable<unknown>,
  | typeof observableBrand
  | 'id'
  | 'kind'
  | 'depth'
  | 'getSnapshot'
  | 'isCompleted'
  | 'updateToken'
  | 'complete'
  | 'dispose'
  | 'subscribe'
  | 'pipe'
>('=');

expectType<
  keyof ChildObservable<unknown>,
  keyof Observable<unknown> | 'parents'
>('=');

// Everything but the brand is not enough to pass for an observable.
expectType<
  StrictOmit<RootObservable<unknown>, typeof observableBrand>,
  Observable<unknown>
>('!<=');

expectType<RootObservable<unknown>['depth'], 0>('=');

expectType<InitializedRootObservable<unknown>['depth'], 0>('=');

expectType<SyncChildObservable<unknown>['depth'], number>('=');

expectType<AsyncChildObservable<unknown>['depth'], number>('=');

expectType<ObservableBase<unknown>['depth'], number>('=');

expectType<Unwrap<Wrap<readonly [1, 2, 3]>>, readonly [1, 2, 3]>('=');

expectType<number, ObservableValue<Observable<number>>>('<=');

expectType<number, ObservableValue<Observable<string>>>('!<=');

expectType<
  readonly [number, string],
  Unwrap<readonly [Observable<number>, Observable<string>]>
>('<=');

expectType<number, ObservableValue<Observable<string>>>('!<=');

expectType<
  FixedLengthTuple<2, Observable<number>>,
  Wrap<FixedLengthTuple<2, number>>
>('<=');

expectType<
  readonly [Observable<number>, Observable<string>],
  Wrap<FixedLengthTuple<2, number>>
>('!<=');
