import { type Result } from '../result/index.mjs';

/**
 * Represents an asynchronous computation that can either succeed (`Ok`) or
 * fail (`Err`) — a `Promise` that resolves to a `Result<S, E>`.
 *
 * Unlike a raw `Promise`, an `AsyncResult` never rejects for expected
 * failures: errors are carried in the `Err` channel with a concrete type `E`,
 * so they can be handled with the same combinators as a synchronous
 * `Result`.
 *
 * @template S The type of the success value.
 * @template E The type of the error value.
 */
export type AsyncResult<S, E> = Promise<Result<S, E>>;

export * as AsyncResult from './impl/index.mjs';
