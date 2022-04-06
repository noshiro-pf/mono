export namespace Num {
  /** @description Number.isInteger */
  export const isInt = (a: number): boolean => Number.isInteger(a);

  /** @description Number.isSafeInteger */
  export const isSafeInt = (a: number): boolean => Number.isSafeInteger(a);

  /** @description check value with Number.isInteger and check range */
  export const isUint32 = (a: number): boolean =>
    Number.isInteger(a) && isInRange(0, 2 ** 32 - 1)(a);

  /**
   * @description 値を与えられた範囲内に収める．targetの値が不正な場合はminを返す．
   * @example
   *  clamp(0, 2)(2.3) // 2,
   *  clamp(0, 2)(-0.5) // 0,
   *  clamp(0, 2)(1.5) // 1.5
   */
  export const clamp =
    (min: number, max: number) =>
    (target: number): number =>
      !Number.isFinite(target) ? min : Math.max(min, Math.min(max, target));

  export const divint = (a: number, b: number): number =>
    Math.floor(Math.floor(a) / Math.floor(b));

  export const isInRange =
    (min: number, max: number) =>
    (target: number): boolean =>
      min <= target && target <= max;

  export const randInt = (min: number, max: number): number =>
    min + Math.floor((max - min + 1) * Math.random());

  export const roundAt = (val: number, precision: number): number => {
    const digit = 10 ** precision;

    return Math.round(val * digit) / digit;
  };

  export const roundBy = (digit: number, value: number): number =>
    Math.round(value * 10 ** digit) / 10 ** digit;

  export const roundToInt = (n: number): number => 0 | (n + 0.5);

  export const round = (digit: number): ((x: number) => number) => {
    const powAmount = 10 ** digit;

    return (target: number) => roundToInt(powAmount * target) / powAmount;
  };

  export const sign = (value: number): -1 | 0 | 1 =>
    value === 0 ? 0 : value < 0 ? -1 : 1;
}
