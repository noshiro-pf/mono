import type {
  auditTime as _auditTime,
  auditTimeI as _auditTimeI,
  combineLatest as _combineLatest,
  combineLatestI as _combineLatestI,
  createBooleanState as _createBooleanState,
  createEventEmitter as _createEventEmitter,
  createReducer as _createReducer,
  createState as _createState,
  createVoidEventEmitter as _createVoidEventEmitter,
  debounceTime as _debounceTime,
  debounceTimeI as _debounceTimeI,
  distinctUntilChanged as _distinctUntilChanged,
  distinctUntilChangedI as _distinctUntilChangedI,
  filter as _filter,
  fromPromise as _fromPromise,
  InitializedObservable as _InitializedObservable,
  map as _map,
  mapI as _mapI,
  mapMaybe as _mapMaybe,
  mapMaybeI as _mapMaybeI,
  mapResultErr as _mapResultErr,
  mapResultErrI as _mapResultErrI,
  mapResultOk as _mapResultOk,
  mapResultOkI as _mapResultOkI,
  mapTo as _mapTo,
  mapToI as _mapToI,
  mapWithIndex as _mapWithIndex,
  mapWithIndexI as _mapWithIndexI,
  Observable as _Observable,
  of as _of,
  pairwise as _pairwise,
  pluck as _pluck,
  pluckI as _pluckI,
  scan as _scan,
  skip as _skip,
  source as _source,
  Subscription as _Subscription,
  throttleTime as _throttleTime,
  throttleTimeI as _throttleTimeI,
  unwrapMaybe as _unwrapMaybe,
  unwrapMaybeI as _unwrapMaybeI,
  unwrapResultErr as _unwrapResultErr,
  unwrapResultErrI as _unwrapResultErrI,
  unwrapResultOk as _unwrapResultOk,
  unwrapResultOkI as _unwrapResultOkI,
  withInitialValue as _withInitialValue,
  withLatestFrom as _withLatestFrom,
  withLatestFromI as _withLatestFromI,
  zip as _zip,
  zipI as _zipI,
} from '@noshiro/syncflow';

declare global {
  type InitializedObservable<A> = _InitializedObservable<A>;
  type Observable<A> = _Observable<A>;
  type Subscription = _Subscription;

  /* custom types */

  const auditTime: typeof _auditTime;
  const auditTimeI: typeof _auditTimeI;
  const combineLatest: typeof _combineLatest;
  const combineLatestI: typeof _combineLatestI;
  const createBooleanState: typeof _createBooleanState;
  const createEventEmitter: typeof _createEventEmitter;
  const createReducer: typeof _createReducer;
  const createState: typeof _createState;
  const createVoidEventEmitter: typeof _createVoidEventEmitter;
  const debounceTime: typeof _debounceTime;
  const debounceTimeI: typeof _debounceTimeI;
  const distinctUntilChanged: typeof _distinctUntilChanged;
  const distinctUntilChangedI: typeof _distinctUntilChangedI;
  const filter: typeof _filter;
  const fromPromise: typeof _fromPromise;
  const map: typeof _map;
  const mapI: typeof _mapI;
  const mapMaybe: typeof _mapMaybe;
  const mapMaybeI: typeof _mapMaybeI;
  const mapResultErr: typeof _mapResultErr;
  const mapResultErrI: typeof _mapResultErrI;
  const mapResultOk: typeof _mapResultOk;
  const mapResultOkI: typeof _mapResultOkI;
  const mapTo: typeof _mapTo;
  const mapToI: typeof _mapToI;
  const mapWithIndex: typeof _mapWithIndex;
  const mapWithIndexI: typeof _mapWithIndexI;
  const of: typeof _of;
  const pairwise: typeof _pairwise;
  const pluck: typeof _pluck;
  const pluckI: typeof _pluckI;
  const scan: typeof _scan;
  const skip: typeof _skip;
  const source: typeof _source;
  const throttleTime: typeof _throttleTime;
  const throttleTimeI: typeof _throttleTimeI;
  const unwrapMaybe: typeof _unwrapMaybe;
  const unwrapMaybeI: typeof _unwrapMaybeI;
  const unwrapResultErr: typeof _unwrapResultErr;
  const unwrapResultErrI: typeof _unwrapResultErrI;
  const unwrapResultOk: typeof _unwrapResultOk;
  const unwrapResultOkI: typeof _unwrapResultOkI;
  const withInitialValue: typeof _withInitialValue;
  const withLatestFrom: typeof _withLatestFrom;
  const withLatestFromI: typeof _withLatestFromI;
  const zip: typeof _zip;
  const zipI: typeof _zipI;

  /* custom variables */
}
