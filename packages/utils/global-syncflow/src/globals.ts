/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import {
  auditTime,
  auditTimeI,
  combineLatest,
  combineLatestI,
  createBooleanState,
  createEventEmitter,
  createReducer,
  createState,
  createVoidEventEmitter,
  debounceTime,
  debounceTimeI,
  distinctUntilChanged,
  distinctUntilChangedI,
  filter,
  fromPromise,
  map,
  mapI,
  mapMaybe,
  mapMaybeI,
  mapResultErr,
  mapResultErrI,
  mapResultOk,
  mapResultOkI,
  mapTo,
  mapToI,
  mapWithIndex,
  mapWithIndexI,
  of,
  pairwise,
  pluck,
  pluckI,
  scan,
  skip,
  source,
  throttleTime,
  throttleTimeI,
  unwrapMaybe,
  unwrapMaybeI,
  unwrapResultErr,
  unwrapResultErrI,
  unwrapResultOk,
  unwrapResultOkI,
  withInitialValue,
  withLatestFrom,
  withLatestFromI,
  zip,
  zipI,
} from '@noshiro/syncflow';

(global as any).auditTime = auditTime;
(global as any).auditTimeI = auditTimeI;
(global as any).combineLatest = combineLatest;
(global as any).combineLatestI = combineLatestI;
(global as any).createBooleanState = createBooleanState;
(global as any).createEventEmitter = createEventEmitter;
(global as any).createReducer = createReducer;
(global as any).createState = createState;
(global as any).createVoidEventEmitter = createVoidEventEmitter;
(global as any).debounceTime = debounceTime;
(global as any).debounceTimeI = debounceTimeI;
(global as any).distinctUntilChanged = distinctUntilChanged;
(global as any).distinctUntilChangedI = distinctUntilChangedI;
(global as any).filter = filter;
(global as any).fromPromise = fromPromise;
(global as any).map = map;
(global as any).mapI = mapI;
(global as any).mapMaybe = mapMaybe;
(global as any).mapMaybeI = mapMaybeI;
(global as any).mapResultErr = mapResultErr;
(global as any).mapResultErrI = mapResultErrI;
(global as any).mapResultOk = mapResultOk;
(global as any).mapResultOkI = mapResultOkI;
(global as any).mapTo = mapTo;
(global as any).mapToI = mapToI;
(global as any).mapWithIndex = mapWithIndex;
(global as any).mapWithIndexI = mapWithIndexI;
(global as any).of = of;
(global as any).pairwise = pairwise;
(global as any).pluck = pluck;
(global as any).pluckI = pluckI;
(global as any).scan = scan;
(global as any).skip = skip;
(global as any).source = source;
(global as any).throttleTime = throttleTime;
(global as any).throttleTimeI = throttleTimeI;
(global as any).unwrapMaybe = unwrapMaybe;
(global as any).unwrapMaybeI = unwrapMaybeI;
(global as any).unwrapResultErr = unwrapResultErr;
(global as any).unwrapResultErrI = unwrapResultErrI;
(global as any).unwrapResultOk = unwrapResultOk;
(global as any).unwrapResultOkI = unwrapResultOkI;
(global as any).withInitialValue = withInitialValue;
(global as any).withLatestFrom = withLatestFrom;
(global as any).withLatestFromI = withLatestFromI;
(global as any).zip = zip;
(global as any).zipI = zipI;
