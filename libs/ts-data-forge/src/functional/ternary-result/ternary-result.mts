/**
 * Represents a `TernaryResult` that is a success, containing a value.
 */
export type TernaryOk<S> = Readonly<{
  /** @internal Discriminant property for the 'Ok' type. */
  $$tag: 'ts-data-forge::Result.ok';

  /** The success value. */
  value: S;
}>;

/**
 * Represents a `TernaryResult` that contains a success value and an attached
 * warning.
 */
export type TernaryWarn<S, W> = Readonly<{
  /** @internal Discriminant property for the 'Warn' type. */
  $$tag: 'ts-data-forge::Result.warn';

  /** The success value. */
  value: S;

  /** The warning value. */
  warning: W;
}>;

/**
 * Represents a `TernaryResult` that is an error, containing an error value.
 */
export type TernaryErr<E> = Readonly<{
  /** @internal Discriminant property for the 'Err' type. */
  $$tag: 'ts-data-forge::Result.err';

  /** The error value. */
  value: E;
}>;

/**
 * Represents a value that can be `Ok`, `Warn`, or `Err`.
 */
export type TernaryResult<S, E, W = E> =
  | TernaryOk<S>
  | TernaryWarn<S, W>
  | TernaryErr<E>;

/**
 * Base type for any `TernaryResult`, used for generic constraints.
 */
export type UnknownTernaryResult =
  | TernaryOk<unknown>
  | TernaryWarn<unknown, unknown>
  | TernaryErr<unknown>;

export * as TernaryResult from './impl/index.mjs';
