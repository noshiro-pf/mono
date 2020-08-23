import { Observable, ObservableInput } from 'rxjs';
import { Unwrap } from './unwrap';
/**
 * @description combineLatest wrapper to apply better type check.
 *
 * In RxJS v6.5.1, type definition of combineLatest is like
 *
 * ```
 * export declare function combineLatest<O extends ObservableInput<any>>(sources: O[], scheduler: SchedulerLike): Observable<ObservedValueOf<O>[]>;
 * export declare function combineLatest<O1 extends ObservableInput<any>>(sources: [O1]): Observable<[ObservedValueOf<O1>]>;
 * export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>>(sources: [O1, O2]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>]>;
 * export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>>(sources: [O1, O2, O3]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>]>;
 * export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>>(sources: [O1, O2, O3, O4]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>]>;
 * export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>]>;
 * export declare function combineLatest<O1 extends ObservableInput<any>, O2 extends ObservableInput<any>, O3 extends ObservableInput<any>, O4 extends ObservableInput<any>, O5 extends ObservableInput<any>, O6 extends ObservableInput<any>>(sources: [O1, O2, O3, O4, O5, O6]): Observable<[ObservedValueOf<O1>, ObservedValueOf<O2>, ObservedValueOf<O3>, ObservedValueOf<O4>, ObservedValueOf<O5>, ObservedValueOf<O6>]>;
 * export declare function combineLatest<O extends ObservableInput<any>>(sources: O[]): Observable<ObservedValueOf<O>[]>;
 * ```
 */
export declare const combineLatestTyped: <T extends ObservableInput<any>[]>(...observables: T) => Observable<Unwrap<T>>;
//# sourceMappingURL=combine-latest.d.ts.map