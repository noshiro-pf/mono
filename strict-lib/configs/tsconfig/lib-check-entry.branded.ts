// Assertions about the branded flavor of the generated lib (`libs-branded/`).
//
// Every harness's `tsconfig.lib-files-check.branded.json` names this file next
// to `output/lib-files-branded`, so it is checked by all twelve TypeScript
// minors against the branded declarations alone. The plain flavor types these
// calls `number`, which is why the assertions live apart from
// `lib-check-entry.ts`.

import type {
  FiniteNumber,
  Int,
  Int16,
  Int32,
  NegativeFiniteNumber,
  NegativeInt32,
  NegativeInt,
  NegativeSafeInt,
  NonNegativeFiniteNumber,
  NonNegativeInt,
  NonPositiveFiniteNumber,
  NonPositiveInt,
  NonZeroNumber,
  PositiveFiniteNumber,
  PositiveInt,
  PositiveSafeInt,
  PositiveUint16,
  PositiveUint32,
  SafeInt,
  SafeUint,
  TypeEq,
  Uint16,
  Uint32,
} from 'ts-type-forge';

/**
 * #2919 — `Math.floor` / `ceil` / `round` / `abs` intersected the result with
 * every brand of the argument, including those the operation does not keep:
 * `Math.floor(0.5)` is `0`, yet a `PositiveFiniteNumber` floored to a type
 * assignable to `NonZeroNumber`; `Math.abs(-32768)` is `32768`, yet an `Int16`
 * stayed an `Int16`. Each result is now built from what the operation
 * preserves. The arrays below assert exact type equality; the
 * `@ts-expect-error` lines are the two cases of the issue, as assignments.
 */
declare const positive: PositiveFiniteNumber;

declare const nonNegative: NonNegativeFiniteNumber;

declare const negative: NegativeFiniteNumber;

declare const nonPositive: NonPositiveFiniteNumber;

declare const finite: FiniteNumber;

declare const int: Int;

declare const int16: Int16;

declare const negativeInt: NegativeInt;

declare const safeInt: SafeInt;

declare const negativeSafeInt: NegativeSafeInt;

declare const uint16: Uint16;

declare const positiveUint16: PositiveUint16;

declare const uint32: Uint32;

declare const positiveOrNegative: PositiveFiniteNumber | NegativeFiniteNumber;

declare const uint16OrInt16: Uint16 | Int16;

declare const int32: Int32;

declare const negativeInt32: NegativeInt32;

// An integer comes back unchanged, brands and all.
const floorOfInt16 = Math.floor(int16);

const ceilOfNegativeInt = Math.ceil(negativeInt);

const roundOfSafeInt = Math.round(safeInt);

// Otherwise the sign bounds survive, and `'!=0'` survives only where rounding
// moves away from zero: `floor` of a negative number, `ceil` of a positive one.
const floorOfPositive = Math.floor(positive);

const ceilOfPositive = Math.ceil(positive);

const roundOfPositive = Math.round(positive);

const floorOfNonNegative = Math.floor(nonNegative);

const ceilOfNonNegative = Math.ceil(nonNegative);

const roundOfNonNegative = Math.round(nonNegative);

const floorOfNegative = Math.floor(negative);

const ceilOfNegative = Math.ceil(negative);

const roundOfNegative = Math.round(negative);

const floorOfNonPositive = Math.floor(nonPositive);

const ceilOfNonPositive = Math.ceil(nonPositive);

const roundOfNonPositive = Math.round(nonPositive);

// A union argument is mapped member by member.
const floorOfPositiveOrNegative = Math.floor(positiveOrNegative);

const roundOfFinite = Math.round(finite);

// A generic caller gets its own type parameter back.
export const floorOfGeneric = <T extends Int>(x: T): T => Math.floor(x);

export const roundingTypes = [
  true satisfies TypeEq<typeof floorOfInt16, Int16>,
  true satisfies TypeEq<typeof ceilOfNegativeInt, NegativeInt>,
  true satisfies TypeEq<typeof roundOfSafeInt, SafeInt>,
  true satisfies TypeEq<typeof floorOfPositive, NonNegativeInt>,
  true satisfies TypeEq<typeof ceilOfPositive, PositiveInt>,
  true satisfies TypeEq<typeof roundOfPositive, NonNegativeInt>,
  true satisfies TypeEq<typeof floorOfNonNegative, NonNegativeInt>,
  true satisfies TypeEq<typeof ceilOfNonNegative, NonNegativeInt>,
  true satisfies TypeEq<typeof floorOfNegative, NegativeInt>,
  true satisfies TypeEq<typeof ceilOfNegative, NonPositiveInt>,
  true satisfies TypeEq<typeof roundOfNegative, NonPositiveInt>,
  true satisfies TypeEq<typeof roundOfNonNegative, NonNegativeInt>,
  true satisfies TypeEq<typeof floorOfNonPositive, NonPositiveInt>,
  true satisfies TypeEq<typeof ceilOfNonPositive, NonPositiveInt>,
  true satisfies TypeEq<typeof roundOfNonPositive, NonPositiveInt>,
  true satisfies TypeEq<
    typeof floorOfPositiveOrNegative,
    NonNegativeInt | NegativeInt
  >,
  true satisfies TypeEq<typeof roundOfFinite, Int>,
] as const;

// @ts-expect-error `Math.floor(0.5)` is `0`, so it is no non-zero divisor.
export const flooredDivisor: NonZeroNumber = Math.floor(positive);

// A non-negative argument comes back unchanged, brands and all: `abs` is the
// identity there.
const absOfUint16 = Math.abs(uint16);

const absOfPositiveUint16 = Math.abs(positiveUint16);

const absOfUint32 = Math.abs(uint32);

const absOfPositive = Math.abs(positive);

export const absOfGeneric = <T extends NonNegativeFiniteNumber>(x: T): T =>
  Math.abs(x);

// Otherwise `abs` keeps finiteness and integrality, turns a signed width into
// the unsigned one (`Math.abs(-32768)` fits 16 unsigned bits), keeps `SafeInt`
// (whose range is symmetric), and is positive exactly when the argument is
// non-zero.
const absOfNegative = Math.abs(negative);

const absOfFinite = Math.abs(finite);

const absOfNegativeInt = Math.abs(negativeInt);

const absOfInt = Math.abs(int);

const absOfSafeInt = Math.abs(safeInt);

const absOfNegativeSafeInt = Math.abs(negativeSafeInt);

const absOfInt16 = Math.abs(int16);

const absOfNonPositive = Math.abs(nonPositive);

const absOfInt32 = Math.abs(int32);

const absOfNegativeInt32 = Math.abs(negativeInt32);

// A union argument is mapped member by member: the `Uint16` keeps its type,
// and the `Int16` becomes one.
const absOfUint16OrInt16 = Math.abs(uint16OrInt16);

export const absTypes = [
  true satisfies TypeEq<typeof absOfUint16, Uint16>,
  true satisfies TypeEq<typeof absOfPositiveUint16, PositiveUint16>,
  true satisfies TypeEq<typeof absOfUint32, Uint32>,
  true satisfies TypeEq<typeof absOfPositive, PositiveFiniteNumber>,
  true satisfies TypeEq<typeof absOfNegative, PositiveFiniteNumber>,
  true satisfies TypeEq<typeof absOfFinite, NonNegativeFiniteNumber>,
  true satisfies TypeEq<typeof absOfNegativeInt, PositiveInt>,
  true satisfies TypeEq<typeof absOfInt, NonNegativeInt>,
  true satisfies TypeEq<typeof absOfSafeInt, SafeUint>,
  true satisfies TypeEq<typeof absOfNegativeSafeInt, PositiveSafeInt>,
  true satisfies TypeEq<typeof absOfInt16, Uint16>,
  true satisfies TypeEq<typeof absOfInt32, Uint32>,
  true satisfies TypeEq<typeof absOfNegativeInt32, PositiveUint32>,
  true satisfies TypeEq<typeof absOfNonPositive, NonNegativeFiniteNumber>,
  true satisfies TypeEq<typeof absOfUint16OrInt16, Uint16>,
] as const;

// @ts-expect-error `Math.abs(-32768)` is `32768`, past `Int16`'s upper bound.
export const absOfInt16AsInt16: Int16 = Math.abs(int16);
