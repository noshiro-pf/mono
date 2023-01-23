import { type Maybe, type Result } from '@noshiro/ts-utils';
import {
  type AsyncChildObservable,
  type InitializedSyncChildObservable,
  type RootObservable,
  type SyncChildObservable,
} from './observable';
import { type NonEmptyUnknownList } from './types';

// RootObservable

export type SourceObservable<A> = RootObservable<A, 'Source'> & {
  readonly next: (value: A) => void;
};

export type OfObservable<A> = RootObservable<A, 'Of'> & {
  readonly emit: () => OfObservable<A>;
};

export type FromArrayObservable<A> = RootObservable<A, 'FromArray'> & {
  readonly emit: () => FromArrayObservable<A>;
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
  readonly start: () => IntervalObservable;
};

export type TimerObservable = RootObservable<number, 'Timer'> & {
  readonly start: () => TimerObservable;
};

// InitializedSyncChildObservable

export type WithInitialValueOperatorObservable<
  A,
  I = A
> = InitializedSyncChildObservable<A | I, 'withInitialValue', readonly [A]>;
export type ScanOperatorObservable<A, B> = InitializedSyncChildObservable<
  B,
  'scan',
  readonly [A]
>;

// SyncChildObservable

export type InitializedCombineLatestObservable<A extends NonEmptyUnknownList> =
  InitializedSyncChildObservable<A, 'combineLatest', A>;

export type CombineLatestObservable<A extends NonEmptyUnknownList> =
  SyncChildObservable<A, 'combineLatest', A>;

export type InitializedZipObservable<A extends NonEmptyUnknownList> =
  InitializedSyncChildObservable<A, 'zip', A>;

export type ZipObservable<A extends NonEmptyUnknownList> = SyncChildObservable<
  A,
  'zip',
  A
>;

export type InitializedMergeObservable<P extends NonEmptyUnknownList> =
  InitializedSyncChildObservable<ArrayElement<P>, 'merge', P>;

export type MergeObservable<P extends NonEmptyUnknownList> =
  SyncChildObservable<ArrayElement<P>, 'merge', P>;

export type MapOperatorObservable<A, B> = SyncChildObservable<
  B,
  'map',
  readonly [A]
>;
export type MapWithIndexOperatorObservable<A, B> = SyncChildObservable<
  B,
  'mapWithIndex',
  readonly [A]
>;
export type MapToOperatorObservable<A, B> = SyncChildObservable<
  B,
  'mapTo',
  readonly [A]
>;
export type PluckOperatorObservable<A, K extends keyof A> = SyncChildObservable<
  A[K],
  'pluck',
  readonly [A]
>;
export type UnwrapMaybeOperatorObservable<A> = SyncChildObservable<
  A | undefined,
  'unwrapMaybe',
  readonly [Maybe<A>]
>;
export type UnwrapResultOkOperatorObservable<S, E> = SyncChildObservable<
  S | undefined,
  'unwrapResultOk',
  readonly [Result<S, E>]
>;
export type UnwrapResultErrOperatorObservable<S, E> = SyncChildObservable<
  E | undefined,
  'unwrapResultErr',
  readonly [Result<S, E>]
>;
export type MapMaybeOperatorObservable<A, B> = SyncChildObservable<
  Maybe<B>,
  'mapMaybe',
  readonly [Maybe<A>]
>;
export type MapResultOkOperatorObservable<S, S2, E> = SyncChildObservable<
  Result<S2, E>,
  'mapResultOk',
  readonly [Result<S, E>]
>;
export type MapResultErrOperatorObservable<S, E, E2> = SyncChildObservable<
  Result<S, E2>,
  'mapResultErr',
  readonly [Result<S, E>]
>;
export type WithIndexOperatorObservable<A> = SyncChildObservable<
  readonly [number, A],
  'withIndex',
  readonly [A]
>;
export type PairwiseOperatorObservable<A> = SyncChildObservable<
  readonly [A, A],
  'pairwise',
  readonly [A]
>;

export type TakeOperatorObservable<A> = SyncChildObservable<
  A,
  'take',
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
export type SkipOperatorObservable<A> = SyncChildObservable<
  A,
  'skip',
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
export type WithLatestFromOperatorObservable<A, B> = SyncChildObservable<
  readonly [A, B],
  'withLatestFrom',
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
export type DistinctUntilChangedOperatorObservable<A> = SyncChildObservable<
  A,
  'distinctUntilChanged',
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
