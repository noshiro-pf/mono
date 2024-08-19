import { expectType, type Result } from '@noshiro/ts-utils';
import {
  type AsyncChildObservable,
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type Observable,
  type RootObservable,
  type SyncChildObservable,
  type Unwrap,
} from './observable.mjs';
import { type NonEmptyUnknownList } from './types.mjs';

// RootObservable

export type SourceObservable<A> = Readonly<{
  next: (value: A) => void;
}> &
  RootObservable<A, 'Source'>;

export type OfObservable<A> = Readonly<{
  emit: () => OfObservable<A>;
}> &
  RootObservable<A, 'Of'>;

export type FromArrayObservable<A> = Readonly<{
  emit: () => FromArrayObservable<A>;
}> &
  RootObservable<A, 'FromArray'>;

export type FromPromiseObservable<A, E = unknown> = RootObservable<
  Result<A, E>,
  'FromPromise'
>;

export type FromSubscribableObservable<A, E = unknown> = RootObservable<
  Result<A, E>,
  'FromSubscribable'
>;

export type IntervalObservable = Readonly<{
  start: () => IntervalObservable;
}> &
  RootObservable<SafeUint, 'Interval'>;

export type TimerObservable = Readonly<{
  start: () => TimerObservable;
}> &
  RootObservable<0, 'Timer'>;

// InitializedSyncChildObservable

export type SetInitialValueOperatorObservable<
  A,
  I = A,
> = InitializedSyncChildObservable<A | I, 'setInitialValue', readonly [A]>;

export type ScanOperatorObservable<A, B> = InitializedSyncChildObservable<
  B,
  'scan',
  readonly [A]
>;

// SyncChildObservable

namespace SyncFlowInternals {
  type Cast<A> = A extends NonEmptyUnknownList ? A : never;

  type EveryInitialized<OS extends NonEmptyArray<Observable<unknown>>> =
    OS extends NonEmptyArray<InitializedObservable<unknown>> ? true : false;

  type IsInitialized<O> = [O] extends [InitializedObservable<unknown>]
    ? true
    : false;

  /** True | false を boolean ではなく true に評価する */
  type LogicalValue<B extends boolean> = [B] extends [true]
    ? true
    : [B] extends [false]
      ? false
      : true;

  type SomeInitializedImpl<OS extends Observable<unknown>> =
    // union distribution
    LogicalValue<OS extends OS ? IsInitialized<OS> : never>;

  type SomeInitialized<OS extends NonEmptyArray<Observable<unknown>>> =
    SomeInitializedImpl<OS[number]>;

  if (import.meta.vitest !== undefined) {
    test('type test', () => {
      expect(1).toBe(1); // dummy
    });

    expectType<EveryInitialized<[Observable<1>]>, false>('=');

    expectType<EveryInitialized<[InitializedObservable<1>]>, true>('=');

    expectType<
      EveryInitialized<[InitializedObservable<1>, InitializedObservable<2>]>,
      true
    >('=');

    expectType<
      EveryInitialized<[Observable<1>, InitializedObservable<2>]>,
      false
    >('=');

    expectType<SomeInitialized<[Observable<1>]>, false>('=');

    expectType<SomeInitialized<[InitializedObservable<1>]>, true>('=');

    expectType<
      SomeInitialized<[InitializedObservable<1>, InitializedObservable<2>]>,
      true
    >('=');

    expectType<
      SomeInitialized<[Observable<1>, InitializedObservable<2>]>,
      true
    >('=');
  }

  type InitializedCombineObservableImpl<A extends NonEmptyUnknownList> =
    InitializedSyncChildObservable<A, 'combine', A>;

  export type CombineObservableImpl<A extends NonEmptyUnknownList> =
    SyncChildObservable<A, 'combine', A>;

  export type CombineObservableRefinedImpl<
    OS extends NonEmptyArray<Observable<unknown>>,
  > =
    EveryInitialized<OS> extends true
      ? InitializedCombineObservableImpl<Cast<Unwrap<OS>>>
      : CombineObservableImpl<Unwrap<OS>>;

  type InitializedZipObservableImpl<A extends NonEmptyUnknownList> =
    InitializedSyncChildObservable<A, 'zip', A>;

  export type ZipObservableImpl<A extends NonEmptyUnknownList> =
    SyncChildObservable<A, 'zip', A>;

  export type ZipObservableRefinedImpl<
    OS extends NonEmptyArray<Observable<unknown>>,
  > =
    EveryInitialized<OS> extends true
      ? InitializedZipObservableImpl<Cast<Unwrap<OS>>>
      : ZipObservableImpl<Unwrap<OS>>;

  type InitializedMergeObservableImpl<P extends NonEmptyUnknownList> =
    InitializedSyncChildObservable<ArrayElement<P>, 'merge', P>;

  export type MergeObservableImpl<P extends NonEmptyUnknownList> =
    SyncChildObservable<ArrayElement<P>, 'merge', P>;

  export type MergeObservableRefinedImpl<
    OS extends NonEmptyArray<Observable<unknown>>,
  > =
    SomeInitialized<OS> extends true
      ? InitializedMergeObservableImpl<Cast<Unwrap<OS>>>
      : MergeObservableImpl<Unwrap<OS>>;
}

export type CombineObservable<A extends NonEmptyUnknownList> =
  SyncFlowInternals.CombineObservableImpl<A>;

export type CombineObservableRefined<
  OS extends NonEmptyArray<Observable<unknown>>,
> = SyncFlowInternals.CombineObservableRefinedImpl<OS>;

export type ZipObservable<A extends NonEmptyUnknownList> =
  SyncFlowInternals.ZipObservableImpl<A>;

export type ZipObservableRefined<
  OS extends NonEmptyArray<Observable<unknown>>,
> = SyncFlowInternals.ZipObservableRefinedImpl<OS>;

export type MergeObservable<A extends NonEmptyUnknownList> =
  SyncFlowInternals.MergeObservableImpl<A>;

export type MergeObservableRefined<
  OS extends NonEmptyArray<Observable<unknown>>,
> = SyncFlowInternals.MergeObservableRefinedImpl<OS>;

export type MapWithIndexOperatorObservable<A, B> = SyncChildObservable<
  B,
  'mapWithIndex',
  readonly [A]
>;

export type PairwiseOperatorObservable<A> = SyncChildObservable<
  readonly [A, A],
  'pairwise',
  readonly [A]
>;

export type TakeWhileOperatorObservable<A> = SyncChildObservable<
  A,
  'takeWhile',
  readonly [A]
>;

export type TakeUntilOperatorObservable<A> = SyncChildObservable<
  A,
  'takeUntil',
  readonly [A]
>;

export type SkipWhileOperatorObservable<A> = SyncChildObservable<
  A,
  'skipWhile',
  readonly [A]
>;

export type SkipUntilOperatorObservable<A> = SyncChildObservable<
  A,
  'skipUntil',
  readonly [A]
>;

export type WithCurrentValueFromOperatorObservable<A, B> = SyncChildObservable<
  readonly [A, B],
  'withCurrentValueFrom',
  readonly [A]
>;

export type WithBufferedFromOperatorObservable<A, B> = SyncChildObservable<
  readonly [A, readonly B[]],
  'withBufferedFrom',
  readonly [A]
>;

export type FilterOperatorObservable<A> = SyncChildObservable<
  A,
  'filter',
  readonly [A]
>;

export type SkipIfNoChangeOperatorObservable<A> = SyncChildObservable<
  A,
  'skipIfNoChange',
  readonly [A]
>;

export type ThrottleTimeOperatorObservable<A> = SyncChildObservable<
  A,
  'throttleTime',
  readonly [A]
>;

// AsyncChildObservable

export type AuditTimeOperatorObservable<A> = AsyncChildObservable<
  A,
  'auditTime',
  readonly [A]
>;

export type DebounceTimeOperatorObservable<A> = AsyncChildObservable<
  A,
  'debounceTime',
  readonly [A]
>;

export type SwitchMapOperatorObservable<A, B> = AsyncChildObservable<
  B,
  'switchMap',
  readonly [A]
>;

export type MergeMapOperatorObservable<A, B> = AsyncChildObservable<
  B,
  'mergeMap',
  readonly [A]
>;
