import {
  noValue,
  view,
  type InitializedObservable,
  type Observable,
} from '../core/index.mjs';
import { AsyncSourceClass } from './async-source-class.mjs';

/**
 * Holds `value` and is settled: it never emits. For a branch of a `switchMap`
 * or `mergeMap` that needs no asynchronous work.
 */
export const just = <const A,>(value: A): InitializedObservable<A> =>
  view(new SettledClass<A>(value));

/**
 * Holds nothing and is settled: it never emits. For a branch of a `switchMap`
 * that should follow nothing.
 */
export const empty = <A,>(): Observable<A> =>
  view(new SettledClass<A>(noValue));

class SettledClass<A> extends AsyncSourceClass<A> {
  constructor(value: A | typeof noValue) {
    super(value);

    this.finish();
  }
}
