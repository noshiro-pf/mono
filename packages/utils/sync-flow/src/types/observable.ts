import { Option } from '@mono/ts-utils';
import { ObservableId, Token } from './id';
import { ObservableKind } from './observable-kind';
import {
  AsyncChildObservableType,
  ObservableType,
  RootObservableType,
  SyncChildObservableType,
} from './observable-type';
import { NonEmptyUnknownList, Operator, Subscription, Wrap } from './types';

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
  addDescendantId: <B>(child: ChildObservable<B>) => void;

  // state
  currentValue: Option<A>;
  isCompleted: boolean;
  token: Token;

  tryUpdate: (token: Token) => void;
  tryComplete: () => void;
  complete: () => void;
  subscribe: (onNext: (v: A) => void, onComplete?: () => void) => Subscription;

  chain: <B>(operator: Operator<A, B>) => Observable<B>;
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

export type AsyncChildObservable<
  A,
  Type extends AsyncChildObservableType,
  P extends NonEmptyUnknownList = NonEmptyUnknownList
> = ObservableBase<A> &
  Readonly<{
    kind: 'async child';
    type: Type;
    parents: Wrap<P>;
  }>;

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
  }>;

export type Observable<A> =
  | RootObservable<A, RootObservableType>
  | SyncChildObservable<A, SyncChildObservableType>
  | AsyncChildObservable<A, AsyncChildObservableType>;

export type ManagerObservable<A> =
  | RootObservable<A, RootObservableType>
  | AsyncChildObservable<A, AsyncChildObservableType>;

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
