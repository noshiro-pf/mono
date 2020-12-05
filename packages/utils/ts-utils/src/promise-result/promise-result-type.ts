import { PromiseError, PromisePending, PromiseSuccess } from '../types';

export type Pending<P> = { status: PromisePending; value: P };
export type Error<E> = { status: PromiseError; value: E };
export type Success<S> = { status: PromiseSuccess; value: S };

export type PromiseResult<P, E, S> = Pending<P> | Error<E> | Success<S>;
