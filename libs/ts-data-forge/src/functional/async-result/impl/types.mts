import { type Err, type Ok } from '../../../types.mjs';
import { type UnknownResult } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';

/**
 * Base type for any `AsyncResult`, used for generic constraints. Represents
 * an `AsyncResult` with unknown success and error types.
 */
export type UnknownAsyncResult = AsyncResult<unknown, unknown>;

/**
 * Extracts the success value type `S` from a `Result.Ok<S>`, or from an
 * `AsyncResult` resolving to one. Distributes over unions, so an
 * `Ok<S> | Err<E>` union resolves to `S`.
 *
 * @template R The `Result` or `AsyncResult` type to unwrap.
 */
export type UnwrapOk<R extends UnknownAsyncResult | UnknownResult> =
  UnwrapOkImpl<SyncResultOf<R>>;

/**
 * Extracts the error value type `E` from a `Result.Err<E>`, or from an
 * `AsyncResult` resolving to one. Distributes over unions, so an
 * `Ok<S> | Err<E>` union resolves to `E`.
 *
 * @template R The `Result` or `AsyncResult` type to unwrap.
 */
export type UnwrapErr<R extends UnknownAsyncResult | UnknownResult> =
  UnwrapErrImpl<SyncResultOf<R>>;

/**
 * @template R The `Result` or `AsyncResult` type.
 * @internal
 * Resolves an `AsyncResult` to its `Result`, leaving a plain `Result`
 * unchanged. Distributive.
 */
type SyncResultOf<R> = R extends Promise<infer P> ? P : R;

/**
 * @template R The `Result` type to unwrap.
 * @internal
 * Distributive extraction of the `Ok` value type.
 */
type UnwrapOkImpl<R> = R extends Ok<infer S> ? S : never;

/**
 * @template R The `Result` type to unwrap.
 * @internal
 * Distributive extraction of the `Err` value type.
 */
type UnwrapErrImpl<R> = R extends Err<infer E> ? E : never;
