export namespace Num {
  export const isInRange =
    (min: number, max: number) =>
    (target: number): boolean =>
      min <= target && target <= max;

  const isUint32Range = isInRange(0, 2 ** 32 - 1);

  /** @description check value with Number.isInteger and check range */
  export const isUint32 = (a: number): boolean =>
    // eslint-disable-next-line no-restricted-globals
    Number.isInteger(a) && isUint32Range(a);

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
      // eslint-disable-next-line no-restricted-globals
      !Number.isFinite(target) ? min : Math.max(min, Math.min(max, target));

  export const divInt = (a: number, b: number): number =>
    Math.floor(Math.floor(a) / Math.floor(b));

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

  /* constants */

  /**
   * The value of Number.EPSILON is the difference between 1 and the smallest value greater than 1
   * that is representable as a Number value, which is approximately:
   * 2.2204460492503130808472633361816 x 10‍−‍16.
   */
  // eslint-disable-next-line no-restricted-globals
  export const EPSILON = Number.EPSILON;

  /**
   * A value that is not a number.
   * In equality comparisons, NaN does not equal any value, including itself. To test whether a value is equivalent to NaN, use the isNaN function.
   */
  // eslint-disable-next-line no-shadow-restricted-names,@typescript-eslint/no-shadow,no-restricted-globals
  export const NaN: number = Number.NaN;

  /** The largest number that can be represented in JavaScript. Equal to approximately 1.79E+308. */
  // eslint-disable-next-line no-restricted-globals
  export const MAX_VALUE: number = Number.MAX_VALUE;

  /** The closest number to zero that can be represented in JavaScript. Equal to approximately 5.00E-324. */
  // eslint-disable-next-line no-restricted-globals
  export const MIN_VALUE: number = Number.MIN_VALUE;

  /**
   * The value of the largest integer n such that n and n + 1 are both exactly representable as
   * a Number value.
   * The value of Number.MAX_SAFE_INTEGER is 9007199254740991 2^53 − 1.
   */
  // eslint-disable-next-line no-restricted-globals
  export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

  /**
   * The value of the smallest integer n such that n and n − 1 are both exactly representable as
   * a Number value.
   * The value of Number.MIN_SAFE_INTEGER is −9007199254740991 (−(2^53 − 1)).
   */
  // eslint-disable-next-line no-restricted-globals
  export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;

  /**
   * A value that is less than the largest negative number that can be represented in JavaScript.
   * JavaScript displays NEGATIVE_INFINITY values as -infinity.
   */
  // eslint-disable-next-line no-restricted-globals
  export const NEGATIVE_INFINITY: number = Number.NEGATIVE_INFINITY;

  /**
   * A value greater than the largest number that can be represented in JavaScript.
   * JavaScript displays POSITIVE_INFINITY values as infinity.
   */
  // eslint-disable-next-line no-restricted-globals
  export const POSITIVE_INFINITY: number = Number.POSITIVE_INFINITY;

  /**
   * Returns true if the value passed is an integer, false otherwise.
   * @param number A numeric value.
   */
  // eslint-disable-next-line no-restricted-globals
  export const isInt = (a: number): boolean => Number.isInteger(a);

  /**
   * Returns true if the value passed is a safe integer.
   * @param number A numeric value.
   */
  // eslint-disable-next-line no-restricted-globals
  export const isSafeInt = (a: number): boolean => Number.isSafeInteger(a);

  /**
   * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a
   * number). Unlike the global isNaN(), Number.isNaN() doesn't forcefully convert the parameter
   * to a number. Only values of the type number, that are also NaN, result in true.
   * @param number A numeric value.
   */
  // eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-shadow
  export const isNaN: (a: number) => boolean = Number.isNaN;

  /**
   * Returns a Boolean value that indicates whether a value is the reserved value NaN (not a
   * number). Unlike the global isNaN(), Number.isNaN() doesn't forcefully convert the parameter
   * to a number. Only values of the type number, that are also NaN, result in true.
   * @param number A numeric value.
   */
  // eslint-disable-next-line no-restricted-globals, @typescript-eslint/no-shadow
  export const isFinite: (a: number) => boolean = Number.isFinite;

  /**
   * Converts a string to a floating-point number.
   * @param str A string that contains a floating-point number.
   */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const parseFloat = (str: string): number | undefined => {
    // eslint-disable-next-line no-restricted-globals
    const result = Number.parseFloat(str);

    return isNaN(result) ? undefined : result;
  };

  /**
   * Converts A string to an integer.
   * @param string A string to convert into a number.
   * @param radix A value between 2 and 36 that specifies the base of the number in `string`.
   * If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal.
   * All other strings are considered decimal.
   */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const parseInt = (str: string, radix?: number): number | undefined => {
    // eslint-disable-next-line no-restricted-globals
    const result = Number.parseInt(str, radix);

    return isNaN(result) ? undefined : result;
  };

  /* instance methods */

  /**
   * Returns a string representation of an object.
   * @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
   */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const toString =
    (radix?: number) =>
    (n: number): string =>
      n.toString(radix);

  /**
   * Returns a string representing a number in fixed-point notation.
   * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  export const toFixed =
    (fractionDigits?: number) =>
    (n: number): string =>
      n.toFixed(fractionDigits);

  /**
   * Returns a string containing a number represented in exponential notation.
   * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
   */
  export const toExponential =
    (fractionDigits?: number) =>
    (n: number): string =>
      n.toExponential(fractionDigits);

  /**
   * Converts a number to a string by using the current or specified locale.
   * @param locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
   * @param options An object that contains one or more properties that specify comparison options.
   */
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export const toLocaleString =
    (
      locales?: string | readonly string[],
      options?: Partial<
        Readonly<{
          localeMatcher: string;
          style: string;
          currency: string;
          currencyDisplay: string;
          currencySign: string;
          useGrouping: boolean;
          minimumIntegerDigits: number;
          minimumFractionDigits: number;
          maximumFractionDigits: number;
          minimumSignificantDigits: number;
          maximumSignificantDigits: number;

          compactDisplay: string;
          notation: string;
          signDisplay: string;
          unit: string;
          unitDisplay: string;
        }>
      >
    ) =>
    (n: number): string =>
      n.toLocaleString(locales, options);
}
