import { ArrayElement, Result } from '@noshiro/ts-utils';
import {
  AsyncChildObservable,
  RootObservable,
  SyncChildObservable,
} from './observable';
import { NonEmptyUnknownList } from './types';

// RootObservable

export type SourceObservable<A> = RootObservable<A, 'Source'> & {
  next: (value: A) => void;
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

// SyncChildObservable

export type CombineLatestObservable<
  A extends NonEmptyUnknownList
> = SyncChildObservable<A, 'combineLatest', A>;

export type ZipObservable<A extends NonEmptyUnknownList> = SyncChildObservable<
  A,
  'zip',
  A
>;

export type MergeObservable<
  P extends NonEmptyUnknownList
> = SyncChildObservable<ArrayElement<P>, 'merge', P>;

export type MapOperatorObservable<A, B> = SyncChildObservable<B, 'map', [A]>;
export type MapWithIndexOperatorObservable<A, B> = SyncChildObservable<
  B,
  'mapWithIndex',
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

export type ScanOperatorObservable<A, B> = SyncChildObservable<B, 'scan', [A]>;
export type FilterOperatorObservable<A> = SyncChildObservable<A, 'filter', [A]>;
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
