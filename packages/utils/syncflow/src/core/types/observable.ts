import { type Maybe, type Some } from '@noshiro/ts-utils';
import { type ObservableId, type UpdaterSymbol } from './id';
import { type ObservableKind } from './observable-kind';
import {
  type AsyncChildObservableType,
  type ObservableType,
  type RootObservableType,
  type SyncChildObservableType,
} from './observable-type';
import { type NonEmptyUnknownList, type Subscription } from './types';

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
  currentValue: Maybe<A>;
  isCompleted: boolean;
  updaterSymbol: UpdaterSymbol;
  hasSubscriber: boolean;
  hasChild: boolean;
  hasActiveChild: () => boolean;

  tryUpdate: (updaterSymbol: UpdaterSymbol) => void;
  tryComplete: () => void;
  complete: () => void;
  subscribe: (onNext: (v: A) => void, onComplete?: () => void) => Subscription;

  chain: (<B>(
    operator: ToInitializedOperator<A, B>
  ) => InitializedObservable<B>) &
    (<B>(operator: ToBaseOperator<A, B>) => Observable<B>);
}>;

export type InitializedObservableBase<A> = ObservableBase<A> &
  Readonly<{
    currentValue: Some<A>;
    chain: (<B>(
      operator:
        | InitializedToInitializedOperator<A, B>
        | ToInitializedOperator<A, B>
    ) => InitializedObservable<B>) &
      (<B>(operator: ToBaseOperator<A, B>) => Observable<B>);
  }>;

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
> = InitializedObservableBase<A> & SyncChildObservable<A, Type, P>;

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
  | AsyncChildObservable<A, AsyncChildObservableType, P>
  | SyncChildObservable<A, SyncChildObservableType, P>;

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
> = InitializedObservableBase<A> & RootObservable<A, Type>;

export type Observable<A> =
  | AsyncChildObservable<A, AsyncChildObservableType>
  | RootObservable<A, RootObservableType>
  | SyncChildObservable<A, SyncChildObservableType>;

export type InitializedObservable<A> =
  | InitializedAsyncChildObservable<A, AsyncChildObservableType>
  | InitializedRootObservable<A, RootObservableType>
  | InitializedSyncChildObservable<A, SyncChildObservableType>;

export type ManagerObservable<A> =
  | AsyncChildObservable<A, AsyncChildObservableType>
  | RootObservable<A, RootObservableType>;

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
  | BaseToBaseOperator<A, B>
  | InitializedToInitializedOperator<A, B>
  | RemoveInitializedOperator<A, B>
  | ToInitializedOperator<A, B>;

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

export type Unwrap<A extends readonly Observable<unknown>[]> = {
  readonly [P in keyof A]: ObservableValue<A[P]>;
};

export type Wrap<A extends readonly unknown[]> = {
  readonly [P in keyof A]: Observable<A[P]>;
};

export type WrapInitialized<A extends readonly unknown[]> = {
  readonly [P in keyof A]: InitializedObservable<A[P]>;
};
