/// <reference types="ts-type-forge" />

type SmallPositiveInt = WithSmallInt<PositiveInt>;

/** Represents the type of keys that can be used in a standard JavaScript Map. */
type MapSetKeyType = Primitive;

type ArrayIndex<Ar extends readonly unknown[]> =
  IsFixedLengthList<Ar> extends true ? IndexOfTuple<Ar> : SizeType.Arr;

type ArgArrayIndex<Ar extends readonly unknown[]> =
  IsFixedLengthList<Ar> extends true ? IndexOfTuple<Ar> : SizeType.ArgArr;

type ArgArrayIndexWithNegative<Ar extends readonly unknown[]> =
  IsFixedLengthList<Ar> extends true
    ? IndexOfTuple<[...Ar, 0]> | NegativeIndexOfTuple<Ar>
    : SizeType.ArgArrWithNegative;

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
// Max array length : 2^32 - 1
// Max string length : 2^53 - 1

declare namespace SizeType {
  type Arr = Uint32;

  type TypedArray = SafeUint;

  type Str = SafeUint;

  type ArrSearchResult = Arr | -1;

  type TypedArraySearchResult = TypedArray | -1;

  type StrSearchResult = Str | -1;

  type ArgArr = WithSmallInt<Arr>;

  type ArgTypedArray = WithSmallInt<TypedArray>;

  type ArgStr = WithSmallInt<Str>;

  type ArgArrWithNegative = WithSmallInt<
    NormalizeBrandUnion<NegativeInt32 | Arr>
  >;

  type ArgTypedArrayWithNegative = WithSmallInt<SafeInt>;

  type ArgStrWithNegative = WithSmallInt<SafeInt>;

  type ArgArrPositive = WithSmallInt<IntersectBrand<PositiveNumber, Arr>>;

  type ArgTypedArrayPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, TypedArray>
  >;

  type ArgStrPositive = WithSmallInt<IntersectBrand<PositiveNumber, Str>>;
}

// #region Optional
/**
 * Represents the 'Some' variant of an {@link Optional}, containing a value.
 *
 * @template S The type of the contained value.
 */
type Some<S> = Readonly<{
  /** @internal Discriminant property for the 'Some' type. */
  $$tag: 'ts-data-forge::Optional.some';

  /** The contained value. */
  value: S;
}>;

/**
 * Represents the 'None' variant of an {@link Optional}, indicating the absence
 * of a value.
 */
type None = Readonly<{
  /** @internal Discriminant property for the 'None' type. */
  $$tag: 'ts-data-forge::Optional.none';
}>;

/**
 * Represents an optional value that can either be `Some` (containing a value)
 * or `None` (empty).
 *
 * @template S The type of the value that might be present.
 */
type Optional<S> = None | Some<S>;

/**
 * Base type for any {@link Optional}, used for generic constraints. Represents
 * an {@link Optional} with an unknown value type.
 */
type UnknownOptional = Optional<unknown>;

// #endregion Optional

// #region Result

/**
 * Represents a `Result` that is a success, containing a value.
 *
 * @template S The type of the success value.
 */
type Ok<S> = Readonly<{
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
type Err<E> = Readonly<{
  /** @internal Discriminant property for the 'Err' type. */
  $$tag: 'ts-data-forge::Result.err';

  /** The error value. */
  value: E;
}>;

/**
 * Represents a value that can either be a success (`Ok`) or an error (`Err`).
 *
 * @template S The type of the success value.
 * @template E The type of the error value.
 */
type Result<S, E> = Ok<S> | Err<E>;

/**
 * Base type for any `Result`, used for generic constraints. Represents a
 * `Result` with unknown success and error types.
 */
type UnknownResult = Result<unknown, unknown>;

// #endregion Result

// #region TernaryResult
/**
 * Represents a `TernaryResult` that is a success, containing a value.
 */
type TernaryOk<S> = Readonly<{
  /** @internal Discriminant property for the 'Ok' type. */
  $$tag: 'ts-data-forge::Result.ok';

  /** The success value. */
  value: S;
}>;

/**
 * Represents a `TernaryResult` that contains a success value and an attached
 * warning.
 */
type TernaryWarn<S, W> = Readonly<{
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
type TernaryErr<E> = Readonly<{
  /** @internal Discriminant property for the 'Err' type. */
  $$tag: 'ts-data-forge::Result.err';

  /** The error value. */
  value: E;
}>;

/**
 * Represents a value that can be `Ok`, `Warn`, or `Err`.
 */
type TernaryResult<S, E, W = E> =
  | TernaryOk<S>
  | TernaryWarn<S, W>
  | TernaryErr<E>;

/**
 * Base type for any `TernaryResult`, used for generic constraints.
 */
type UnknownTernaryResult = TernaryResult<unknown, unknown, unknown>;

// #endregion TernaryResult
