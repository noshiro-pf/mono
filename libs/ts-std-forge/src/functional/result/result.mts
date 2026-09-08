import { type Err, type Ok } from '../../adt-types.mjs';

/**
 * Represents a value that can either be a success (`Ok`) or an error (`Err`).
 *
 * @template S The type of the success value.
 * @template E The type of the error value.
 */
export type Result<S, E> = Ok<S> | Err<E>;

/**
 * Base type for any `Result`, used for generic constraints. Represents a
 * `Result` with unknown success and error types.
 */
export type UnknownResult = Ok<unknown> | Err<unknown>;

export type { Err, Ok } from '../../adt-types.mjs';

export * as Result from './impl/index.mjs';
