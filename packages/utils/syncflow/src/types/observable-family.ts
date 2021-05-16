import type { ArrayElement, Option, Result } from '@noshiro/ts-utils';
import type {
  AsyncChildObservable,
  InitializedSyncChildObservable,
  RootObservable,
  SyncChildObservable,
} from './observable';
import type { NonEmptyUnknownList } from './types';

// RootObservable

export type SourceObservable<A> = RootObservable<A, 'Source'> & {
  next: (value: A) => void;
};

export type OfObservable<A> = RootObservable<A, 'Of'> & {
  emit: () => OfObservable<A>;
};

export type FromArrayObservable<A> = RootObservable<A, 'FromArray'> & {
  emit: () => FromArrayObservable<A>;
};

export type FromPromiseObservable<A, E = unknown> = RootObservable<
  Result<A, E>,
  'FromPromise'
>;

export type FromSubscribableObservable<A, E = unknown> = RootObservable<
  Result<A, E>,
  'FromSubscribable'
>;

export type IntervalObservable = RootObservable<number, 'Interval'> & {
  start: () => IntervalObservable;
};

export type TimerObservable = RootObservable<number, 'Timer'> & {
  start: () => TimerObservable;
};

// InitilaizedSyncChildObservable

export type WithInitialValueOperatorObservable<
  A,
  I = A
> = InitializedSyncChildObservable<A | I, 'withInitialValue', [A]>;
export type ScanOperatorObservable<A, B> = InitializedSyncChildObservable<
  B,
  'scan',
  [A]
>;

// SyncChildObservable

export type InitializedCombineLatestObservable<
  A extends NonEmptyUnknownList
> = InitializedSyncChildObservable<A, 'combineLatest', A>;

export type CombineLatestObservable<
  A extends NonEmptyUnknownList
> = SyncChildObservable<A, 'combineLatest', A>;

export type InitializedZipObservable<
  A extends NonEmptyUnknownList
> = InitializedSyncChildObservable<A, 'zip', A>;

export type ZipObservable<A extends NonEmptyUnknownList> = SyncChildObservable<
  A,
  'zip',
  A
>;

export type InitializedMergeObservable<
  P extends NonEmptyUnknownList
> = InitializedSyncChildObservable<ArrayElement<P>, 'merge', P>;

export type MergeObservable<
  P extends NonEmptyUnknownList
> = SyncChildObservable<ArrayElement<P>, 'merge', P>;

export type MapOperatorObservable<A, B> = SyncChildObservable<B, 'map', [A]>;
export type MapWithIndexOperatorObservable<A, B> = SyncChildObservable<
  B,
  'mapWithIndex',
  [A]
>;
export type MapToOperatorObservable<A, B> = SyncChildObservable<
  B,
  'mapTo',
  [A]
>;
export type PluckOperatorObservable<A, K extends keyof A> = SyncChildObservable<
  A[K],
  'pluck',
  [A]
>;
export type UnwrapOptionOperatorObservable<A> = SyncChildObservable<
  A | undefined,
  'unwrapOption',
  [Option<A>]
>;
export type UnwrapResultOkOperatorObservable<S, E> = SyncChildObservable<
  S | undefined,
  'unwrapResultOk',
  [Result<S, E>]
>;
export type UnwrapResultErrOperatorObservable<S, E> = SyncChildObservable<
  E | undefined,
  'unwrapResultErr',
  [Result<S, E>]
>;
export type MapOptionOperatorObservable<A, B> = SyncChildObservable<
  Option<B>,
  'mapOption',
  [Option<A>]
>;
export type MapResultOkOperatorObservable<S, S2, E> = SyncChildObservable<
  Result<S2, E>,
  'mapResultOk',
  [Result<S, E>]
>;
export type MapResultErrOperatorObservable<S, E, E2> = SyncChildObservable<
  Result<S, E2>,
  'mapResultErr',
  [Result<S, E>]
>;
export type WithIndexOperatorObservable<A> = SyncChildObservable<
  [number, A],
  'withIndex',
  [A]
>;
export type PairwiseOperatorObservable<A> = SyncChildObservable<
  [A, A],
  'pairwise',
  [A]
>;

export type TakeOperatorObservable<A> = SyncChildObservable<A, 'take', [A]>;
export type TakeWhileOperatorObservable<A> = SyncChildObservable<
  A,
  'takeWhile',
  [A]
>;
export type TakeUntilOperatorObservable<A> = SyncChildObservable<
  A,
  'takeUntil',
  [A]
>;
export type SkipOperatorObservable<A> = SyncChildObservable<A, 'skip', [A]>;
export type SkipWhileOperatorObservable<A> = SyncChildObservable<
  A,
  'skipWhile',
  [A]
>;
export type SkipUntilOperatorObservable<A> = SyncChildObservable<
  A,
  'skipUntil',
  [A]
>;
export type WithLatestFromOperatorObservable<A, B> = SyncChildObservable<
  [A, B],
  'withLatestFrom',
  [A]
>;
export type WithBufferedFromOperatorObservable<A, B> = SyncChildObservable<
  [A, B[]],
  'withBufferedFrom',
  [A]
>;

export type FilterOperatorObservable<A> = SyncChildObservable<A, 'filter', [A]>;
export type DistinctUntilChangedOperatorObservable<A> = SyncChildObservable<
  A,
  'distinctUntilChanged',
  [A]
>;
export type ThrottleTimeOperatorObservable<A> = SyncChildObservable<
  A,
  'throttleTime',
  [A]
>;

// AsyncChildObservable

export type AuditTimeOperatorObservable<A> = AsyncChildObservable<
  A,
  'auditTime',
  [A]
>;
export type DebounceTimeOperatorObservable<A> = AsyncChildObservable<
  A,
  'debounceTime',
  [A]
>;
export type SwitchMapOperatorObservable<A, B> = AsyncChildObservable<
  B,
  'switchMap',
  [A]
>;
export type MergeMapOperatorObservable<A, B> = AsyncChildObservable<
  B,
  'mergeMap',
  [A]
>;
