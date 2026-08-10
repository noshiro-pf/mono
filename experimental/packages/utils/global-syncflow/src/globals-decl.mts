import {
  type InitializedObservable as TYPE_InitializedObservable,
  type Observable as TYPE_Observable,
  type Subscription as TYPE_Subscription,
  type auditTime as VAR_auditTime,
  type combine as VAR_combine,
  type createEventEmitter as VAR_createEventEmitter,
  type createVoidEventEmitter as VAR_createVoidEventEmitter,
  type debounceTime as VAR_debounceTime,
  type filter as VAR_filter,
  type fromPromise as VAR_fromPromise,
  type map as VAR_map,
  type mapMaybe as VAR_mapMaybe,
  type mapResultErr as VAR_mapResultErr,
  type mapResultOk as VAR_mapResultOk,
  type mapTo as VAR_mapTo,
  type mapWithIndex as VAR_mapWithIndex,
  type of as VAR_of,
  type pairwise as VAR_pairwise,
  type pluck as VAR_pluck,
  type scan as VAR_scan,
  type setInitialValue as VAR_setInitialValue,
  type skip as VAR_skip,
  type skipIfNoChange as VAR_skipIfNoChange,
  type source as VAR_source,
  type throttleTime as VAR_throttleTime,
  type unwrapMaybe as VAR_unwrapMaybe,
  type unwrapResultErr as VAR_unwrapResultErr,
  type unwrapResultOk as VAR_unwrapResultOk,
  type withCurrentValueFrom as VAR_withCurrentValueFrom,
  type zip as VAR_zip,
} from '@noshiro/syncflow';

declare global {
  type InitializedObservable<A> = TYPE_InitializedObservable<A>;
  type Observable<A> = TYPE_Observable<A>;
  type Subscription = TYPE_Subscription;

  /* custom types */

  const auditTime: typeof VAR_auditTime;
  const combine: typeof VAR_combine;
  const createEventEmitter: typeof VAR_createEventEmitter;
  const createVoidEventEmitter: typeof VAR_createVoidEventEmitter;
  const debounceTime: typeof VAR_debounceTime;
  const filter: typeof VAR_filter;
  const fromPromise: typeof VAR_fromPromise;
  const map: typeof VAR_map;
  const mapMaybe: typeof VAR_mapMaybe;
  const mapResultErr: typeof VAR_mapResultErr;
  const mapResultOk: typeof VAR_mapResultOk;
  const mapTo: typeof VAR_mapTo;
  const mapWithIndex: typeof VAR_mapWithIndex;
  const of: typeof VAR_of;
  const pairwise: typeof VAR_pairwise;
  const pluck: typeof VAR_pluck;
  const scan: typeof VAR_scan;
  const setInitialValue: typeof VAR_setInitialValue;
  const skip: typeof VAR_skip;
  const skipIfNoChange: typeof VAR_skipIfNoChange;
  const source: typeof VAR_source;
  const throttleTime: typeof VAR_throttleTime;
  const unwrapMaybe: typeof VAR_unwrapMaybe;
  const unwrapResultErr: typeof VAR_unwrapResultErr;
  const unwrapResultOk: typeof VAR_unwrapResultOk;
  const withCurrentValueFrom: typeof VAR_withCurrentValueFrom;
  const zip: typeof VAR_zip;

  /* custom variables */
}
