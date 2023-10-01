import { expectType } from '../expect-type.mjs';

const from: (n: unknown) => number = Number;

/** `lowerBound <= x < upperBound` */
const isInRange =
  (lowerBound: number, upperBound: number) =>
  (x: number): boolean =>
    lowerBound <= x && x < upperBound;

/** `lowerBound <= x <= upperBound` */
const isInRangeInclusive =
  (lowerBound: number, upperBound: number) =>
  (x: number): boolean =>
    lowerBound <= x && x <= upperBound;

type LEQ = {
  readonly [N in SmallUint]: Index<N>;
};

/* cspell:disable-next-line */
type LEQC = {
  readonly [N in SmallUint]: Index<N> | N;
};

/** `lowerBound <= x < upperBound` */
const isUintInRange =
  <L extends SmallUint, U extends SmallUint>(lowerBound: L, upperBound: U) =>
  (x: number): x is RelaxedExclude<LEQ[U], LEQ[Min<L>]> =>
    Number.isSafeInteger(x) && lowerBound <= x && x < upperBound;

/** `lowerBound <= x <= upperBound` */
const isUintInRangeInclusive =
  <L extends SmallUint, U extends SmallUint>(lowerBound: L, upperBound: U) =>
  /* cspell:disable-next-line */
  (x: number): x is RelaxedExclude<LEQC[U], LEQ[Min<L>]> =>
    Number.isSafeInteger(x) && lowerBound <= x && x <= upperBound;

/**
 * 値を与えられた範囲内に収める．targetの値が不正な場合はminを返す．
 *
 * @example
 *   clamp(0, 2)(2.3); // 2
 *   clamp(0, 2)(-0.5); // 0
 *   clamp(0, 2)(1.5); // 1.5
 */
const clamp =
  <N extends number>(lowerBound: N, upperBound: N) =>
  (target: N): N =>
    !Number.isFinite(target)
      ? lowerBound
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Math.max(lowerBound, Math.min(upperBound, target)) as N);

const isNonZero = <N extends number>(
  a: N,
): a is NonZeroNumber & RelaxedExclude<N, 0> => a !== 0;

if (import.meta.vitest !== undefined) {
  expectType<NonZeroNumber & RelaxedExclude<123, 0>, UnknownBrand>('<=');
  test('dummy', () => {
    expect(0).toBe(0);
  });
}

const isNonNegative = <N extends number>(
  a: N,
): a is NonNegativeNumber & RelaxedExclude<N, NegativeIndex<1024>> => a >= 0;

const isPositive = <N extends number>(
  a: N,
): a is PositiveNumber & RelaxedExclude<N, NegativeIndex<1024> | 0> => a > 0;

const div = (a: number, b: NonZeroNumber | SmallInt<'!=0'>): number =>
  // eslint-disable-next-line total-functions/no-partial-division
  a / b;

// TODO: generate code
function add(
  a: PositiveFiniteNumber,
  b: NonNegativeFiniteNumber,
): PositiveFiniteNumber;
function add(
  a: NonNegativeFiniteNumber,
  b: PositiveFiniteNumber,
): PositiveFiniteNumber;
function add(a: FiniteNumber, b: FiniteNumber): FiniteNumber;
function add(a: FiniteNumber, b: FiniteNumber): FiniteNumber {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return (a + b) as FiniteNumber;
}

// ValidNumber
// FiniteNumber
// NonZeroNumber
// NonNegativeNumber
// PositiveNumber
// NegativeNumber
// NonZeroFiniteNumber
// NonNegativeFiniteNumber
// PositiveFiniteNumber
// NegativeFiniteNumber
// Int
// Uint
// PositiveInt
// NegativeInt
// NonZeroInt
// SafeInt
// SafeUint
// PositiveSafeInt
// NegativeSafeInt
// NonZeroSafeInt
// Int32
// Int16
// Uint32
// Uint16
// NegativeInt32
// NegativeInt16

const roundAt = (val: number, precision: number): number => {
  const digit = 10 ** precision;

  // eslint-disable-next-line total-functions/no-partial-division
  return Math.round(val * digit) / digit;
};

const roundBy = (digit: number, value: number): number =>
  // eslint-disable-next-line total-functions/no-partial-division
  Math.round(value * 10 ** digit) / 10 ** digit;

const roundToInt = (n: number): Int =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (0 | (n + 0.5)) as Int;

const round = (digit: number): ((x: number) => number) => {
  const powAmount = 10 ** digit;

  return (target: number) =>
    // eslint-disable-next-line total-functions/no-partial-division
    roundToInt(powAmount * target) / powAmount;
};

const mapNaN2Undefined = <N extends number>(
  value: N,
): RelaxedExclude<N, NaNType> | undefined =>
  Number.isNaN(value)
    ? undefined
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (value as RelaxedExclude<N, NaNType>);

const increment = <N extends SmallUint>(n: N): Increment<N> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (n + 1) as Increment<N>;

type PositiveSmallInt = SmallInt<'>0'>;
const decrement = <N extends PositiveSmallInt>(n: N): Decrement<N> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (n - 1) as Decrement<N>;

export const Num = {
  from,
  isInRange,
  isInRangeInclusive,
  isUintInRange,
  isUintInRangeInclusive,
  isNonZero,
  isNonNegative,
  isPositive,
  div,
  add,
  clamp,
  roundAt,
  roundBy,
  roundToInt,
  round,
  mapNaN2Undefined,
  increment,
  decrement,
} as const;
