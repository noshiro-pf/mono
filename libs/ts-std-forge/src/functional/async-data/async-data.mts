import type { Err, Ok } from '../../adt-types.mjs';
import type { Optional } from '../optional/index.mjs';

/**
 * The request has not started yet.
 */
export type AsyncIdle = Readonly<{
  /** @internal Discriminant property for the 'Idle' type. */
  $$tag: 'ts-data-forge::AsyncData.idle';
}>;

/**
 * The request is in flight. `previous` is the latest success value, kept while
 * a request is repeated; it is `None` on the first request.
 */
export type AsyncPending<S> = Readonly<{
  /** @internal Discriminant property for the 'Pending' type. */
  $$tag: 'ts-data-forge::AsyncData.pending';

  /** The latest success value, if there has been one. */
  previous: Optional<S>;
}>;

/**
 * The request finished and failed. It is the `Err` of `Result` with the latest
 * success value attached, so a settled `AsyncData` can be passed to the
 * `Result` functions as it is.
 */
export type AsyncErr<S, E> = Err<E> &
  Readonly<{
    /** The latest success value, if there has been one. */
    previous: Optional<S>;
  }>;

/**
 * The state of data fetched asynchronously: not started (`AsyncIdle`), in
 * flight (`AsyncPending`), succeeded (the `Ok` of `Result`) or failed
 * (`AsyncErr`).
 *
 * The settled states are a `Result<S, E>`; `AsyncData.isSettled` narrows to
 * them. While a request is repeated, and after it fails, the latest success
 * value stays available as `previous` (see `AsyncData.latestOk`).
 *
 * @template S The type of the success value.
 * @template E The type of the error.
 */
export type AsyncData<S, E> =
  AsyncIdle | AsyncPending<S> | Ok<S> | AsyncErr<S, E>;

/**
 * Base type for any {@link AsyncData}, used for generic constraints.
 */
export type UnknownAsyncData =
  AsyncIdle | AsyncPending<unknown> | Ok<unknown> | AsyncErr<unknown, unknown>;

export * as AsyncData from './impl/index.mjs';
