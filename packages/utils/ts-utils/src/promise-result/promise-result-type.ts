import type { PromiseError, PromisePending, PromiseSuccess } from '../types';

export type Pending<P> = { status: PromisePending; value: P };
export type SettleError<E> = { status: PromiseError; value: E };
export type SettleSuccess<S> = { status: PromiseSuccess; value: S };

export type PromiseState<P, E, S> =
  | Pending<P>
  | SettleError<E>
  | SettleSuccess<S>;
