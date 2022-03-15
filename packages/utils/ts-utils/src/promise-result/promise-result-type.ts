import type { PromiseError, PromisePending, PromiseSuccess } from '../types';

export type Pending<P> = Readonly<{ status: PromisePending; value: P }>;
export type SettleError<E> = Readonly<{ status: PromiseError; value: E }>;
export type SettleSuccess<S> = Readonly<{ status: PromiseSuccess; value: S }>;

export type PromiseState<P, E, S> =
  | Pending<P>
  | SettleError<E>
  | SettleSuccess<S>;
