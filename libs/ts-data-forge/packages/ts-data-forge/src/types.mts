import {
  type IndexOfTuple,
  type IntersectBrand,
  type IsFixedLengthList,
  type NegativeIndexOfTuple,
  type NegativeInt32,
  type NormalizeBrandUnion,
  type PositiveInt,
  type PositiveNumber,
  type Primitive,
  type SafeInt,
  type SafeUint,
  type Uint32,
  type WithSmallInt,
} from 'ts-type-forge';

export type SmallPositiveInt = WithSmallInt<PositiveInt>;

/** Represents the type of keys that can be used in a standard JavaScript Map. */
export type MapSetKeyType = Primitive;

export type ArrayIndex<Ar extends readonly unknown[]> =
  IsFixedLengthList<Ar> extends true ? IndexOfTuple<Ar> : SizeType.Arr;

export type ArgArrayIndex<Ar extends readonly unknown[]> =
  IsFixedLengthList<Ar> extends true ? IndexOfTuple<Ar> : SizeType.ArgArr;

export type ArgArrayIndexWithNegative<Ar extends readonly unknown[]> =
  IsFixedLengthList<Ar> extends true
    ? IndexOfTuple<readonly [...Ar, 0]> | NegativeIndexOfTuple<Ar>
    : SizeType.ArgArrWithNegative;

// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/length
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length
// Max array length : 2^32 - 1
// Max string length : 2^53 - 1

export namespace SizeType {
  export type Arr = Uint32;

  export type TypedArray = SafeUint;

  export type Str = SafeUint;

  export type ArrSearchResult = Arr | -1;

  export type TypedArraySearchResult = TypedArray | -1;

  export type StrSearchResult = Str | -1;

  export type ArgArr = WithSmallInt<Arr>;

  export type ArgTypedArray = WithSmallInt<TypedArray>;

  export type ArgStr = WithSmallInt<Str>;

  export type ArgArrWithNegative = WithSmallInt<
    NormalizeBrandUnion<NegativeInt32 | Arr>
  >;

  export type ArgTypedArrayWithNegative = WithSmallInt<SafeInt>;

  export type ArgStrWithNegative = WithSmallInt<SafeInt>;

  export type ArgArrPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, Arr>
  >;

  export type ArgTypedArrayPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, TypedArray>
  >;

  export type ArgStrPositive = WithSmallInt<
    IntersectBrand<PositiveNumber, Str>
  >;
}

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
