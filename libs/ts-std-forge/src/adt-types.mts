/**
 * The variant shapes of the algebraic data types in `functional/`
 * (`Optional` and `Result`). Ported from ts-data-forge (Sumi D-49 stage 1);
 * `Result`'s `$$tag` discriminants keep their original strings so that a value
 * made here and one made by ts-data-forge stay the same type while both copies
 * exist.
 */

// #region Optional
/**
 * Represents the 'Some' variant of an Optional, containing a value.
 *
 * At runtime a `Some` is not an object: it is the value it holds (see
 * `Optional.some`), falsy and nullish ones included, so an Optional is never
 * tested with truthiness, `??`, `?.` or a default parameter, which would take a
 * `Some` of `0` or `undefined` for a missing value. The properties below exist only in the type, to tell `Some` from `None` and from
 * the bare value; they are never present at runtime, so read the value with
 * `Optional.unwrap` and friends, never through them. For the same reason, test
 * an Optional with `Optional.isSome` / `Optional.isNone`, never with `typeof`
 * or `in`: a `Some` of a string is a string. An API that branches on what kind
 * of value it is given acts on the value a `Some` holds: `await` resolves a
 * `Some` of a thenable, React's `useState` calls a `Some` of a function, and
 * `concat` spreads a `Some` of an array. As a `WeakMap` key, a `Some` is its
 * value: `None` and a `Some` of a primitive throw (a non-registered symbol
 * aside), and a `Some` of an object is the same key as that object. These are what holding the value
 * unwrapped costs. An Optional made by a version before Optional was unwrapped
 * (`{ $$tag, value }`, from storage or a second copy of the package) is not one
 * to this package's functions: `Optional.isSome` reads one, even an old `None`,
 * as a `Some` of that object.
 *
 * The discriminant is one key with a literal per variant, as `$$tag` was, so
 * that `Some<S> & None` reduces to `never`. The keys are strings rather than
 * `unique symbol`s so that two copies of this package declare the same type,
 * which leaves them readable, and an object literal that has them assignable,
 * as `$$tag` was: only `Optional.some` and `Optional.none` make an Optional.
 *
 * @template S The type of the contained value.
 */
export type Some<S> = Readonly<{
  /** @internal Type-only discriminant; absent at runtime. */
  'ts-std-forge::Optional': 'some';

  /**
   * @internal Type-only; absent at runtime. Read the value with
   *   `Optional.unwrap`.
   */
  'ts-std-forge::Optional.value': S;
}>;

/**
 * Represents the 'None' variant of an Optional, indicating the absence of a
 * value.
 *
 * At runtime `None` is one reserved string (see `Optional.none`). As with
 * {@link Some}, the property below exists only in the type.
 */
export type None = Readonly<{
  /** @internal Type-only discriminant; absent at runtime. */
  'ts-std-forge::Optional': 'none';
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
