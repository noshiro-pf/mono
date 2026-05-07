import { type None, type Some } from '../../types.mjs';

/**
 * Represents an optional value that can either be `Some` (containing a value)
 * or `None` (empty).
 *
 * @template S The type of the value that might be present.
 */
export type Optional<S> = None | Some<S>;

/**
 * Base type for any {@link Optional}, used for generic constraints. Represents
 * an {@link Optional} with an unknown value type.
 */
export type UnknownOptional = None | Some<unknown>;

export type { None, Some } from '../../types.mjs';

export * as Optional from './impl/index.mjs';
