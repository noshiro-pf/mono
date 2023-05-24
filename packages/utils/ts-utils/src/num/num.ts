const from: (n: unknown) => number = Number;

const isInRange =
  (min: number, max: number) =>
  (target: number): boolean =>
    min <= target && target <= max;

/**
 * @description 値を与えられた範囲内に収める．targetの値が不正な場合はminを返す．
 * @example
 *  clamp(0, 2)(2.3) // 2
 *  clamp(0, 2)(-0.5) // 0
 *  clamp(0, 2)(1.5) // 1.5
 */
const clamp =
  <N extends number>(min: N, max: N) =>
  (target: N): N =>
    !Number.isFinite(target)
      ? min
      : (Math.max(min, Math.min(max, target)) as N);

const isNonZero = <N extends number>(
  a: N
): a is NonZeroNumber & RelaxedExclude<N, 0> => a !== 0;

const isNonNegative = <N extends number>(
  a: N
): a is NonNegativeNumber & RelaxedExclude<N, NegativeIndex<1024>> => a >= 0;

const isUintInRange =
  <Min extends number, Max extends number>(min: Min, max: Max) =>
  (target: number): target is UintRange<Min, Max> =>
    min <= target && target <= max;

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

export const Num = {
  from,
  toString,
  isInRange,
  isUintInRange,
  isNonZero,
  isNonNegative,
  clamp,
  roundAt,
  roundBy,
  roundToInt,
  round,
  mapNaN2Undefined,
} as const;
