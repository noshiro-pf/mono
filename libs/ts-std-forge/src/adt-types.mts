/**
 * The variant shapes of the algebraic data types in `functional/`
 * (`Optional` and `Result`). Ported from ts-data-forge (Sumi D-49 stage 1);
 * the `$$tag` discriminants keep their original strings so that a value made
 * here and one made by ts-data-forge stay the same type while both copies
 * exist.
 */

// #region Optional
/**
 * Represents the 'Some' variant of an Optional, containing a value.
 *
 * @template S The type of the contained value.
 */
export type Some<S> = Readonly<{
  /** @internal Discriminant property for the 'Some' type. */
  $$tag: 'ts-data-forge::Optional.some';

  /** The contained value. */
  value: S;
}>;

/**
 * Represents the 'None' variant of an Optional, indicating the absence
 * of a value.
 */
export type None = Readonly<{
  /** @internal Discriminant property for the 'None' type. */
  $$tag: 'ts-data-forge::Optional.none';
}>;

// #endregion Optional

// #region Result

/**
 * Represents a `Result` that is a success, containing a value.
 *
 * @template S The type of the success value.
 */
export type Ok<S> = Readonly<{
  /** @internal Discriminant property for the 'Ok' type. */
  $$tag: 'ts-data-forge::Result.ok';

  /** The success value. */
  value: S;
}>;

/**
 * Represents a `Result` that is an error, containing an error value.
 *
 * @template E The type of the error value.
 */
export type Err<E> = Readonly<{
  /** @internal Discriminant property for the 'Err' type. */
  $$tag: 'ts-data-forge::Result.err';

  /** The error value. */
  value: E;
}>;

// #endregion Result
