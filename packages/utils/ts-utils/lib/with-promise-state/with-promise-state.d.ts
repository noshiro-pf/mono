import { PromiseError, PromisePending, PromiseSuccess } from '../types';
export declare type Pending<P> = {
    status: PromisePending;
    value: P;
};
export declare type Error<E> = {
    status: PromiseError;
    value: E;
};
export declare type Success<S> = {
    status: PromiseSuccess;
    value: S;
};
export declare type WithPromiseState<P, E, S> = Pending<P> | Error<E> | Success<S>;
export declare type WPS<P, E, S> = WithPromiseState<P, E, S>;
//# sourceMappingURL=with-promise-state.d.ts.map