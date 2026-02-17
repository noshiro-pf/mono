import { expectType, type Optional } from 'ts-data-forge';
import { type ObservableId, type UpdaterSymbol } from './id.mjs';
import { type ObservableKind } from './observable-kind.mjs';
import { type NonEmptyUnknownList, type Subscription } from './types.mjs';

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
  id: ObservableId;
  kind: Kind;

  // reactive dependency tree structure
  depth: ObservableKind extends 'root' ? 0 : number;
  addChild: <B>(child: ChildObservable<B>) => void;

  // state
  getSnapshot: () => Optional<A>;
  isCompleted: boolean;
  updaterSymbol: UpdaterSymbol;
  hasSubscriber: boolean;
  hasChild: boolean;
  hasActiveChild: () => boolean;

  tryUpdate: (updaterSymbol: UpdaterSymbol) => void;
  tryComplete: () => void;
  complete: () => void;
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

  export type ToManager<
    A,
    O extends CreateObservableType<A, 'async child' | 'root'>,
  > = O &
    Readonly<{
      addDescendant: <B>(child: ChildObservable<B>) => void;
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
> = ObservableTypeConverter.ToManager<
  A,
  ObservableTypeConverter.ToChild<A, CreateObservableType<A, 'async child'>, P>
>;

export type InitializedAsyncChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = ObservableTypeConverter.ToInitialized<A, AsyncChildObservable<A, P>>;

export type ChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = AsyncChildObservable<A, P> | SyncChildObservable<A, P>;

export type RootObservable<A> = ObservableTypeConverter.ToManager<
  A,
  CreateObservableType<A, 'root'>
>;

export type InitializedRootObservable<A> =
  ObservableTypeConverter.ToInitialized<A, RootObservable<A>>;

export type Observable<A> =
  | AsyncChildObservable<A>
  | RootObservable<A>
  | SyncChildObservable<A>;

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

expectType<keyof AsyncChildObservable<unknown>, 'addDescendant'>('>=');

expectType<keyof RootObservable<unknown>, 'addDescendant'>('>=');

expectType<Unwrap<Wrap<readonly [1, 2, 3]>>, readonly [1, 2, 3]>('=');

expectType<number, ObservableValue<Observable<number>>>('<=');

expectType<number, ObservableValue<Observable<string>>>('!<=');

expectType<
  readonly [number, string],
  Unwrap<readonly [Observable<number>, Observable<string>]>
>('<=');

expectType<number, ObservableValue<Observable<string>>>('!<=');

expectType<
  readonly [Observable<number>, Observable<number>],
  Wrap<readonly [number, number]>
>('<=');

expectType<
  readonly [Observable<number>, Observable<string>],
  Wrap<readonly [number, number]>
>('!<=');
