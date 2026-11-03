import {
  fromAbortablePromise,
  map,
  switchMap,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { AsyncData, Result } from 'ts-std-forge';

/**
 * The request for the latest value of `query$`, as `AsyncData`: a new value
 * aborts the request before it. The request for the value `query$` holds is
 * sent at once, so the result is pending from the start.
 */
export const latestRequest = <Q, A>(
  query$: InitializedObservable<Q>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM class, handed over by `fromAbortablePromise`
  request: (query: Q, signal: AbortSignal) => Promise<A>,
): InitializedObservable<AsyncData<A, unknown>> =>
  query$
    .pipe(switchMap((query) => fromRequest((signal) => request(query, signal))))
    // `switchMap` already holds that pending value; its type does not say so.
    .pipe(withInitialValue<AsyncData<A, unknown>>(AsyncData.pending()));

/**
 * One request as `AsyncData`: pending at once, then its result. Unsubscribing
 * aborts the request, which is what `switchMap` does when it moves on.
 */
const fromRequest = <A,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM class, handed over by `fromAbortablePromise`
  request: (signal: AbortSignal) => Promise<A>,
): InitializedObservable<AsyncData<A, unknown>> =>
  fromAbortablePromise(request)
    .pipe(
      map((result): AsyncData<A, unknown> =>
        Result.isOk(result)
          ? AsyncData.ok(result.value)
          : AsyncData.err(result.value),
      ),
    )
    .pipe(withInitialValue<AsyncData<A, unknown>>(AsyncData.pending()));
