import { type Maybe, type Result } from '@noshiro/ts-utils';
import {
  type AsyncChildObservable,
  type InitializedSyncChildObservable,
  type RootObservable,
  type SyncChildObservable,
} from './observable';
import { type NonEmptyUnknownList } from './types';

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
  RootObservable<number, 'Interval'>;

export type TimerObservable = Readonly<{
  start: () => TimerObservable;
}> &
  RootObservable<number, 'Timer'>;

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
export type UnwrapMaybeOperatorObservable<M extends Maybe.Base> =
  SyncChildObservable<Maybe.Unwrap<M> | undefined, 'unwrapMaybe', readonly [M]>;
export type UnwrapResultOkOperatorObservable<R extends Result.Base> =
  SyncChildObservable<
    Result.UnwrapOk<R> | undefined,
    'unwrapResultOk',
    readonly [R]
  >;
export type UnwrapResultErrOperatorObservable<R extends Result.Base> =
  SyncChildObservable<
    Result.UnwrapErr<R> | undefined,
    'unwrapResultErr',
    readonly [R]
  >;
export type MapMaybeOperatorObservable<
  M extends Maybe.Base,
  B
> = SyncChildObservable<Maybe<B>, 'mapMaybe', readonly [M]>;
export type MapResultOkOperatorObservable<
  R extends Result.Base,
  S2
> = SyncChildObservable<
  Result<S2, Result.UnwrapErr<R>>,
  'mapResultOk',
  readonly [R]
>;
export type MapResultErrOperatorObservable<
  R extends Result.Base,
  E2
> = SyncChildObservable<
  Result<Result.UnwrapOk<R>, E2>,
  'mapResultErr',
  readonly [R]
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
