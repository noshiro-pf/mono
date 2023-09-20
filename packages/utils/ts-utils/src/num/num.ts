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
  (x: number): x is RelaxedExclude<LEQC[U], LEQ[Min<L>]> =>
    Number.isSafeInteger(x) && lowerBound <= x && x <= upperBound;

/**
 * @description 値を与えられた範囲内に収める．targetの値が不正な場合はminを返す．
 * @example
 *  clamp(0, 2)(2.3) // 2
 *  clamp(0, 2)(-0.5) // 0
 *  clamp(0, 2)(1.5) // 1.5
 */
const clamp =
  <N extends number>(lowerBound: N, upperBound: N) =>
  (target: N): N =>
    !Number.isFinite(target)
      ? lowerBound
      : (Math.max(lowerBound, Math.min(upperBound, target)) as N);

const isNonZero = <N extends number>(
  a: N
): a is NonZeroNumber & RelaxedExclude<N, 0> => a !== 0;

const isNonNegative = <N extends number>(
  a: N
): a is NonNegativeNumber & RelaxedExclude<N, NegativeIndex<1024>> => a >= 0;

const roundAt = (val: number, precision: number): number => {
  const digit = 10 ** precision;

  return Math.round(val * digit) / digit;
};

const roundBy = (digit: number, value: number): number =>
  Math.round(value * 10 ** digit) / 10 ** digit;

const roundToInt = (n: number): Int => (0 | (n + 0.5)) as Int;

const round = (digit: number): ((x: number) => number) => {
  const powAmount = 10 ** digit;

  return (target: number) => roundToInt(powAmount * target) / powAmount;
};

const mapNaN2Undefined = <N extends number>(
  value: N
): RelaxedExclude<N, NaNType> | undefined =>
  Number.isNaN(value) ? undefined : (value as RelaxedExclude<N, NaNType>);

const increment = <N extends SmallUint>(n: N): Increment<N> =>
  // eslint-disable-next-line no-restricted-syntax
  (n + 1) as Increment<N>;

type PositiveSmallInt = SmallInt<'>0'>;
const decrement = <N extends PositiveSmallInt>(n: N): Decrement<N> =>
  // eslint-disable-next-line no-restricted-syntax
  (n - 1) as Decrement<N>;

export const Num = {
  from,
  toString,
  isInRange,
  isInRangeInclusive,
  isUintInRange,
  isUintInRangeInclusive,
  isNonZero,
  isNonNegative,
  clamp,
  roundAt,
  roundBy,
  roundToInt,
  round,
  mapNaN2Undefined,
  increment,
  decrement,
} as const;
