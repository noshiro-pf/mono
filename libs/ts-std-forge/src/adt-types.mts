/**
 * The variant shapes of the algebraic data types in `functional/`
 * (`Optional` and `Result`). Ported from ts-data-forge (Sumi D-49 stage 1);
 * `Result`'s `$$tag` discriminants keep their original strings so that a value
 * made here and one made by ts-data-forge stay the same type while both copies
 * exist.
 */

import type { optionalValue, optionalVariant } from 'ts-std-forge-keys';

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
 * that `Some<S> & None` reduces to `never`. The keys are `unique symbol`s that
 * are declared and never defined (in ts-std-forge-keys), so that no object
 * literal that writes them out passes for an Optional and no property access
 * reads a `Some`'s value. The spread of an Optional keeps its type but not its
 * value (`{ ...some }` is `{}` at runtime), so it is no Optional to trust. They
 * are declared in a package of their own so that every copy of this package
 * that depends on the same version of it declares the same `Optional`; that
 * version changes with the runtime encoding, so two copies that read each
 * other's Optionals wrongly declare types that are not assignable to each
 * other.
 *
 * Each is an object type of its own rather than `Readonly<{ ... }>`, so that a
 * consumer's declaration emit names it (`import("ts-std-forge").Some<1>`)
 * instead of spelling its keys out, which it could not: the keys are not
 * visible from the consumer's package. A type that has to be spelled out (the
 * spread of an Optional, a mapped type over one that TypeScript expands) fails
 * that emit with TS4023 and needs an annotation.
 *
 * @template S The type of the contained value.
 */
// An object type of its own, not `Readonly<{ ... }>`: see above.
// transformer-ignore-next-line convert-to-readonly
export type Some<S> = {
  /** @internal Type-only discriminant; absent at runtime. */
  readonly [optionalVariant]: 'some';

  /**
   * @internal Type-only; absent at runtime. Read the value with
   *   `Optional.unwrap`.
   */
  readonly [optionalValue]: S;
};

/**
 * Represents the 'None' variant of an Optional, indicating the absence of a
 * value.
 *
 * At runtime `None` is one reserved string (see `Optional.none`). As with
 * {@link Some}, the property below exists only in the type.
 */
// An object type of its own, not `Readonly<{ ... }>`: see `Some`.
// transformer-ignore-next-line convert-to-readonly
export type None = {
  /** @internal Type-only discriminant; absent at runtime. */
  readonly [optionalVariant]: 'none';
};

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
