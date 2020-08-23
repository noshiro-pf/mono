import { Error, Pending, Success, WPS } from './with-promise-state';
export declare const isUnresolved: <P, E, S>(wps: import("./with-promise-state").WithPromiseState<P, E, S>) => wps is Pending<P>;
export declare const isError: <P, E, S>(wps: import("./with-promise-state").WithPromiseState<P, E, S>) => wps is Error<E>;
export declare const isSuccess: <P, E, S>(wps: import("./with-promise-state").WithPromiseState<P, E, S>) => wps is Success<S>;
//# sourceMappingURL=is.d.ts.map