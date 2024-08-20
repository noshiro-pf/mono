import { expectType, type Maybe } from '@noshiro/ts-utils';
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
  snapshot: Maybe<A>;
  isCompleted: boolean;
  updaterSymbol: UpdaterSymbol;
  hasSubscriber: boolean;
  hasChild: boolean;
  hasActiveChild: () => boolean;

  tryUpdate: (updaterSymbol: UpdaterSymbol) => void;
  tryComplete: () => void;
  complete: () => void;
  subscribe: (onNext: (v: A) => void, onComplete?: () => void) => Subscription;

  chain: //
  (<B>(operator: SetInitialValueOperator<A, B>) => InitializedObservable<B>) &
    (<B>(operator: DropInitialValueOperator<A, B>) => Observable<B>) &
    (<B>(operator: KeepInitialValueOperator<A, B>) => Observable<B>);
}>;

export type ObservableBase<A> = CreateObservableType<A, ObservableKind>;

/** @internal */
namespace ObservableTypeConverter {
  export type ToInitialized<
    A,
    O extends CreateObservableType<A, ObservableKind>,
  > = Omit<O, 'chain' | 'snapshot'> &
    Readonly<{
      snapshot: Maybe.Some<A>;

      chain: //
      (<B>(
        operator: SetInitialValueOperator<A, B>,
      ) => InitializedObservable<B>) &
        (<B>(operator: DropInitialValueOperator<A, B>) => Observable<B>) &
        (<B>(
          operator: KeepInitialValueOperator<A, B>,
        ) => InitializedObservable<B>);
    }>;

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

/** Observable を初期値有り Observable に変換するオペレータの型 */
export type SetInitialValueOperator<A, B> = (
  src: Observable<A>,
) => InitializedObservable<B>;

/** Observable を初期値無し Observable に変換するオペレータの型 */
export type DropInitialValueOperator<A, B> = (
  src: InitializedObservable<A> | Observable<A>,
) => Observable<B>;

/** Observable の初期値の有無を維持するオペレータの型 */
export type KeepInitialValueOperator<A, B> = (
  src: InitializedObservable<A>,
) => InitializedObservable<B>;

export type Operator<A, B> =
  | SetInitialValueOperator<A, B>
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

export type Unwrap<A extends readonly Observable<unknown>[]> = {
  readonly [P in keyof A]: ObservableValue<A[P]>;
};

export type Wrap<A extends readonly unknown[]> = {
  readonly [P in keyof A]: Observable<A[P]>;
};

export type WrapInitialized<A extends readonly unknown[]> = {
  readonly [P in keyof A]: InitializedObservable<A[P]>;
};

// type GetDestTypeOfOperator<Op extends Operator<unknown, unknown>> =
//   Op extends Operator<unknown, infer B> ? B : never;

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

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
}
