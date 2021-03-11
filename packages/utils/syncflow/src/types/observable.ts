import {
  assertNotType,
  assertType,
  Option,
  TypeExtends,
} from '@noshiro/ts-utils';
import { ObservableId, Token } from './id';
import { ObservableKind } from './observable-kind';
import {
  AsyncChildObservableType,
  ObservableType,
  RootObservableType,
  SyncChildObservableType,
} from './observable-type';
import { NonEmptyUnknownList, Subscription } from './types';

/**
 * inheritance
 *
 * ObservableBase
 *   |
 *   +- SyncChildObservable    \                       \
 *   |                          +-- ChildObservable     \
 *   +- AsyncChildObservable   X                         +-- Observable
 *   |                          +-- ManagerObservable   /
 *   +- RootObservableType     /                       /
 *
 */

export type ObservableBase<A> = Readonly<{
  id: ObservableId;
  kind: ObservableKind;
  type: ObservableType;

  // reactive dependency tree structure
  depth: number;
  addChild: <B>(child: ChildObservable<B>) => void;

  // state
  currentValue: Option<A>;
  isCompleted: boolean;
  token: Token;

  tryUpdate: (token: Token) => void;
  tryComplete: () => void;
  complete: () => void;
  subscribe: (onNext: (v: A) => void, onComplete?: () => void) => Subscription;

  chain: (<B>(
    operator: ToInitializedOperator<A, B>
  ) => InitializedObservable<B>) &
    (<B>(operator: ToBaseOperator<A, B>) => Observable<B>);
}>;

export type InitializedObservableBase<A> = ObservableBase<A> & {
  readonly currentValue: Option.Some<A>;
  readonly chain: (<B>(
    operator:
      | InitializedToInitializedOperator<A, B>
      | ToInitializedOperator<A, B>
  ) => InitializedObservable<B>) &
    (<B>(operator: ToBaseOperator<A, B>) => Observable<B>);
};

export type SyncChildObservable<
  A,
  Type extends SyncChildObservableType,
  P extends NonEmptyUnknownList = NonEmptyUnknownList
> = ObservableBase<A> &
  Readonly<{
    kind: 'sync child';
    type: Type;
    parents: Wrap<P>;
  }>;

export type InitializedSyncChildObservable<
  A,
  Type extends SyncChildObservableType,
  P extends NonEmptyUnknownList = NonEmptyUnknownList
> = SyncChildObservable<A, Type, P> & InitializedObservableBase<A>;

export type AsyncChildObservable<
  A,
  Type extends AsyncChildObservableType,
  P extends NonEmptyUnknownList = NonEmptyUnknownList
> = ObservableBase<A> &
  Readonly<{
    kind: 'async child';
    type: Type;
    parents: Wrap<P>;
    addDescendant: <B>(child: ChildObservable<B>) => void;
  }>;

export type InitializedAsyncChildObservable<
  A,
  Type extends AsyncChildObservableType,
  P extends NonEmptyUnknownList = NonEmptyUnknownList
> = AsyncChildObservable<A, Type, P> & InitializedObservableBase<A>;

export type ChildObservable<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList
> =
  | SyncChildObservable<A, SyncChildObservableType, P>
  | AsyncChildObservable<A, AsyncChildObservableType, P>;

export type RootObservable<
  A,
  Type extends RootObservableType
> = ObservableBase<A> &
  Readonly<{
    kind: 'root';
    type: Type;
    depth: 0;
    addDescendant: <B>(child: ChildObservable<B>) => void;
  }>;

export type InitializedRootObservable<
  A,
  Type extends RootObservableType
> = RootObservable<A, Type> & InitializedObservableBase<A>;

export type Observable<A> =
  | RootObservable<A, RootObservableType>
  | SyncChildObservable<A, SyncChildObservableType>
  | AsyncChildObservable<A, AsyncChildObservableType>;

export type InitializedObservable<A> =
  | InitializedRootObservable<A, RootObservableType>
  | InitializedSyncChildObservable<A, SyncChildObservableType>
  | InitializedAsyncChildObservable<A, AsyncChildObservableType>;

export type ManagerObservable<A> =
  | RootObservable<A, RootObservableType>
  | AsyncChildObservable<A, AsyncChildObservableType>;

export type InitializedToInitializedOperator<A, B> = (
  src: InitializedObservable<A>
) => InitializedObservable<B>;

export type ToInitializedOperator<A, B> = (
  src: InitializedObservable<A> | Observable<A>
) => InitializedObservable<B>;

export type RemoveInitializedOperator<A, B> = (
  src: InitializedObservable<A> | Observable<A>
) => Observable<B>;
export type ToBaseOperator<A, B> = RemoveInitializedOperator<A, B>; // alias

type BaseToBaseOperator<A, B> = (src: Observable<A>) => Observable<B>;

export type Operator<A, B> =
  | InitializedToInitializedOperator<A, B>
  | ToInitializedOperator<A, B>
  | RemoveInitializedOperator<A, B>
  | BaseToBaseOperator<A, B>;

export const isManagerObservable = <A>(
  obs: Observable<A>
): obs is ManagerObservable<A> => obs.kind !== 'sync child';

export const isRootObservable = <A>(
  obs: Observable<A>
): obs is RootObservable<A, RootObservableType> => obs.kind === 'root';

export const isChildObservable = <A>(
  obs: Observable<A>
): obs is ChildObservable<A> =>
  obs.kind === 'sync child' || obs.kind === 'async child';

export type ObservableValue<A> = A extends Observable<infer B> ? B : never;

export type Unwrap<A extends Observable<unknown>[]> = {
  [P in keyof A]: ObservableValue<A[P]>;
};

export type Wrap<A extends unknown[]> = { [P in keyof A]: Observable<A[P]> };
export type WrapInitialized<A extends unknown[]> = {
  [P in keyof A]: InitializedObservable<A[P]>;
};

assertType<TypeExtends<number, ObservableValue<Observable<number>>>>();
assertNotType<TypeExtends<number, ObservableValue<Observable<string>>>>();

assertType<
  TypeExtends<
    [number, string],
    Unwrap<[Observable<number>, Observable<string>]>
  >
>();
assertNotType<TypeExtends<number, ObservableValue<Observable<string>>>>();

assertType<
  TypeExtends<[Observable<number>, Observable<number>], Wrap<[number, number]>>
>();
assertNotType<
  TypeExtends<[Observable<number>, Observable<string>], Wrap<[number, number]>>
>();
