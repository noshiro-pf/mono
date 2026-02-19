import { expectType, type Result } from 'ts-data-forge';
import {
  type AsyncChildObservable,
  type InitializedObservable,
  type InitializedRootObservable,
  type InitializedSyncChildObservable,
  type Observable,
  type RootObservable,
  type SyncChildObservable,
  type Unwrap,
} from './observable.mjs';
import { type NonEmptyUnknownList } from './types.mjs';

// RootObservable

export type InitializedSourceObservable<A> = Readonly<{
  next: (value: A) => void;
}> &
  InitializedRootObservable<A>;

export type SourceObservable<A> = Readonly<{
  next: (value: A) => void;
}> &
  RootObservable<A>;

export type OfObservable<A> = Readonly<{
  emit: () => OfObservable<A>;
}> &
  RootObservable<A>;

export type FromArrayObservable<A> = Readonly<{
  emit: () => FromArrayObservable<A>;
}> &
  RootObservable<A>;

export type FromPromiseObservable<A, E = unknown> = RootObservable<
  Result<A, E>
>;

export type FromSubscribableObservable<A, E = unknown> = RootObservable<
  Result<A, E>
>;

export type IntervalObservable = Readonly<{
  start: () => IntervalObservable;
}> &
  RootObservable<SafeUint>;

export type TimerObservable = Readonly<{
  start: () => TimerObservable;
}> &
  RootObservable<0>;

// InitializedSyncChildObservable

export type WithInitialValueOperatorObservable<
  A,
  I = A,
> = InitializedSyncChildObservable<A | I, readonly [A]>;

export type ScanOperatorObservable<A, B> = InitializedSyncChildObservable<
  B,
  readonly [A]
>;

// SyncChildObservable

namespace SynStateInternals {
  type Cast<A> = A extends NonEmptyUnknownList ? A : never;

  type EveryInitialized<OS extends NonEmptyArray<Observable<unknown>>> =
    OS extends NonEmptyArray<InitializedObservable<unknown>> ? true : false;

  type IsInitialized<O> = readonly [O] extends readonly [
    InitializedObservable<unknown>,
  ]
    ? true
    : false;

  /** Evaluates True | false as true instead of boolean */
  type LogicalValue<B extends boolean> = readonly [B] extends readonly [true]
    ? true
    : readonly [B] extends readonly [false]
      ? false
      : true;

  type SomeInitializedImpl<OS extends Observable<unknown>> =
    // union distribution
    LogicalValue<OS extends OS ? IsInitialized<OS> : never>;

  type SomeInitialized<OS extends NonEmptyArray<Observable<unknown>>> =
    SomeInitializedImpl<OS[number]>;

  expectType<EveryInitialized<readonly [Observable<1>]>, false>('=');

  expectType<EveryInitialized<readonly [InitializedObservable<1>]>, true>('=');

  expectType<
    EveryInitialized<
      readonly [InitializedObservable<1>, InitializedObservable<2>]
    >,
    true
  >('=');

  expectType<
    EveryInitialized<readonly [Observable<1>, InitializedObservable<2>]>,
    false
  >('=');

  expectType<SomeInitialized<readonly [Observable<1>]>, false>('=');

  expectType<SomeInitialized<readonly [InitializedObservable<1>]>, true>('=');

  expectType<
    SomeInitialized<
      readonly [InitializedObservable<1>, InitializedObservable<2>]
    >,
    true
  >('=');

  expectType<
    SomeInitialized<readonly [Observable<1>, InitializedObservable<2>]>,
    true
  >('=');

  type InitializedCombineObservableImpl<A extends NonEmptyUnknownList> =
    InitializedSyncChildObservable<A, A>;

  export type CombineObservableImpl<A extends NonEmptyUnknownList> =
    SyncChildObservable<A, A>;

  export type CombineObservableRefinedImpl<
    OS extends NonEmptyArray<Observable<unknown>>,
  > =
    EveryInitialized<OS> extends true
      ? InitializedCombineObservableImpl<Cast<Unwrap<OS>>>
      : CombineObservableImpl<Unwrap<OS>>;

  type InitializedZipObservableImpl<A extends NonEmptyUnknownList> =
    InitializedSyncChildObservable<A, A>;

  export type ZipObservableImpl<A extends NonEmptyUnknownList> =
    SyncChildObservable<A, A>;

  export type ZipObservableRefinedImpl<
    OS extends NonEmptyArray<Observable<unknown>>,
  > =
    EveryInitialized<OS> extends true
      ? InitializedZipObservableImpl<Cast<Unwrap<OS>>>
      : ZipObservableImpl<Unwrap<OS>>;

  type InitializedMergeObservableImpl<P extends NonEmptyUnknownList> =
    InitializedSyncChildObservable<ArrayElement<P>, P>;

  export type MergeObservableImpl<P extends NonEmptyUnknownList> =
    SyncChildObservable<ArrayElement<P>, P>;

  export type MergeObservableRefinedImpl<
    OS extends NonEmptyArray<Observable<unknown>>,
  > =
    SomeInitialized<OS> extends true
      ? InitializedMergeObservableImpl<Cast<Unwrap<OS>>>
      : MergeObservableImpl<Unwrap<OS>>;
}

export type CombineObservable<A extends NonEmptyUnknownList> =
  SynStateInternals.CombineObservableImpl<A>;

export type CombineObservableRefined<
  OS extends NonEmptyArray<Observable<unknown>>,
> = SynStateInternals.CombineObservableRefinedImpl<OS>;

export type ZipObservable<A extends NonEmptyUnknownList> =
  SynStateInternals.ZipObservableImpl<A>;

export type ZipObservableRefined<
  OS extends NonEmptyArray<Observable<unknown>>,
> = SynStateInternals.ZipObservableRefinedImpl<OS>;

export type MergeObservable<A extends NonEmptyUnknownList> =
  SynStateInternals.MergeObservableImpl<A>;

export type MergeObservableRefined<
  OS extends NonEmptyArray<Observable<unknown>>,
> = SynStateInternals.MergeObservableRefinedImpl<OS>;

export type MapWithIndexOperatorObservable<A, B> = SyncChildObservable<
  B,
  readonly [A]
>;

export type PairwiseOperatorObservable<A> = SyncChildObservable<
  readonly [A, A],
  readonly [A]
>;

export type TakeWhileOperatorObservable<A> = SyncChildObservable<
  A,
  readonly [A]
>;

export type TakeUntilOperatorObservable<A> = SyncChildObservable<
  A,
  readonly [A]
>;

export type SkipWhileOperatorObservable<A> = SyncChildObservable<
  A,
  readonly [A]
>;

export type SkipUntilOperatorObservable<A> = SyncChildObservable<
  A,
  readonly [A]
>;

export type WithCurrentValueFromOperatorObservable<A, B> = SyncChildObservable<
  readonly [A, B],
  readonly [A]
>;

export type WithBufferedFromOperatorObservable<A, B> = SyncChildObservable<
  readonly [A, readonly B[]],
  readonly [A]
>;

export type FilterOperatorObservable<A> = SyncChildObservable<A, readonly [A]>;

export type SkipIfNoChangeOperatorObservable<A> = SyncChildObservable<
  A,
  readonly [A]
>;

export type ThrottleTimeOperatorObservable<A> = SyncChildObservable<
  A,
  readonly [A]
>;

// AsyncChildObservable

export type AuditTimeOperatorObservable<A> = AsyncChildObservable<
  A,
  readonly [A]
>;

export type DebounceTimeOperatorObservable<A> = AsyncChildObservable<
  A,
  readonly [A]
>;

export type SwitchMapOperatorObservable<A, B> = AsyncChildObservable<
  B,
  readonly [A]
>;

export type MergeMapOperatorObservable<A, B> = AsyncChildObservable<
  B,
  readonly [A]
>;
