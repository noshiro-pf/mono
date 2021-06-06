import type { ArrayElement } from '@noshiro/ts-utils';
import type { Observable, ObservableInput } from 'rxjs';
import { merge } from 'rxjs';
import type { Unwrap } from './unwrap';

/**
 * @description combineLatest wrapper to apply better type check.
 *
 * In RxJS v6.5.1, type definition of combineLatest is like
 *
 * ```
 * export declare function merge<T>(v1: ObservableInput<T>): Observable<T>;
 * export declare function merge<T>(v1: ObservableInput<T>, concurrent?: number): Observable<T>;
 * export declare function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>): Observable<T | T2>;
 * export declare function merge<T, T2>(v1: ObservableInput<T>, v2: ObservableInput<T2>, concurrent?: number): Observable<T | T2>;
 * export declare function merge<T, T2, T3>(v1: ObservableInput<T>, v2: ObservableInput<T2>, v3: ObservableInput<T3>): Observable<T | T2 | T3>;
 * export declare function merge<T, R>(...observables: (ObservableInput<any> | number)[]): Observable<R>;
 * ```
 */
export const mergeTyped = merge as <
  T extends readonly ObservableInput<unknown>[]
>(
  ...observables: T
) => Observable<ArrayElement<Unwrap<T>>>;
