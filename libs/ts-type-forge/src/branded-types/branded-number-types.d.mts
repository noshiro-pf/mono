/** @internal */
declare namespace TSTypeForgeInternals {
  type IntRangeKeys =
    | '< 2^15'
    | '< 2^16'
    | '< 2^31'
    | '< 2^32'
    | '> -2^16'
    | '> -2^32'
    | '>= -2^15'
    | '>= -2^31'
    | '>=0';

  type Keys_ =
    | IntRangeKeys
    | '!=0'
    | 'Finite'
    | 'Float32'
    | 'Float64'
    | 'Int'
    | 'NaNValue'
    | 'SafeInt';

  type BrandedNumberBaseType = Brand<number, never, never>;

  type ExtendNumberBrand<
    B extends BrandedNumberBaseType,
    T extends RelaxedExclude<Keys_, UnwrapBrandTrueKeys<B>>,
    F extends RelaxedExclude<Keys_, T | UnwrapBrandFalseKeys<B>> = never,
  > = Brand<
    GetBrandValuePart<B>,
    T | (UnwrapBrandTrueKeys<B> & string),
    F | (UnwrapBrandFalseKeys<B> & string)
  >;

  type SmallIntIndexMax = 40;

  /** Integers in `[1, MaxIndex - 1]` */
  type SmallPositiveInt<MaxIndex extends number = SmallIntIndexMax> =
    RelaxedExclude<Index<MaxIndex>, 0>;

  /** Integers in `[-MaxIndex, -1]` */
  type SmallNegativeInt<MaxIndex extends number = SmallIntIndexMax> =
    NegativeIndex<MaxIndex>;

  type WithSmallIntImpl<N extends Int, MaxIndex extends number> =
    | Exclude<
        SmallInt<'', MaxIndex>,
        | (N extends NegativeNumber ? SmallInt<'>=0', MaxIndex> : never)
        | (N extends NonNegativeNumber ? SmallInt<'<0', MaxIndex> : never)
        | (N extends NonZeroNumber ? 0 : never)
      >
    | N;
}

/*
number
├── NaNType
└── ValidNumber
    ├── InfiniteNumber
    │   ├── POSITIVE_INFINITY
    │   └── NEGATIVE_INFINITY
    └── FiniteNumber
        └── Int
            ├── NonZeroInt (intersection with NonZeroNumber)
            │   ├── PositiveInt
            │   └── NegativeInt
            │       ├── NegativeInt32
            │       │   └── NegativeInt16
            │       └── NegativeSafeInt (intersection with SafeInt)
            ├── Uint
            │   ├── PositiveInt (intersection with PositiveNumber)
            │   ├── Uint32
            │   │   └── Uint16
            │   └── SafeUint (intersection with NonNegativeNumber)
            │       └── PositiveSafeInt (intersection with PositiveInt)
            ├── SafeInt
            │   ├── SafeUint (intersection with NonNegativeNumber)
            │   ├── PositiveSafeInt (intersection with PositiveInt)
            │   ├── NegativeSafeInt (intersection with NegativeNumber)
            │   └── NonZeroSafeInt (intersection with NonZeroNumber)
            ├── Int32
            │   ├── Int16
            │   │   ├── Uint16
            │   │   └── NegativeInt16
            │   ├── Uint32
            │   │   └── Uint16
            │   ├── NegativeInt32
            │   │   └── NegativeInt16
            └── WithSmallInt variants
                ├── IntWithSmallInt
                ├── SafeIntWithSmallInt
                ├── UintWithSmallInt
                ├── SafeUintWithSmallInt
                ├── PositiveIntWithSmallInt
                ├── PositiveSafeIntWithSmallInt
                ├── NegativeIntWithSmallInt
                ├── NegativeSafeIntWithSmallInt
                ├── NonZeroIntWithSmallInt
                ├── NonZeroSafeIntWithSmallInt
                ├── Int32WithSmallInt
                ├── Int16WithSmallInt
                ├── Uint32WithSmallInt
                ├── Uint16WithSmallInt
                ├── NegativeInt32WithSmallInt
                └── NegativeInt16WithSmallInt

separate hierarchies:
├── NonNegativeNumber
│   ├── PositiveNumber
│   └── NonNegativeFiniteNumber
│       └── PositiveFiniteNumber
├── NonZeroNumber
│   ├── PositiveNumber
│   ├── NegativeNumber
│   └── NonZeroFiniteNumber
        ├── PositiveFiniteNumber
        └── NegativeFiniteNumber
├── NegativeNumber
│   ├── NegativeFiniteNumber
│   └── NEGATIVE_INFINITY
├── PositiveNumber
│   ├── PositiveFiniteNumber
│   └── POSITIVE_INFINITY
├── SmallInt<T>
│   ├── SmallUint
│   └── literal integer unions
├── Float32
├── Float64
├── BigInt64 (bigint base)
└── BigUint64 (bigint base)

*/

/**
 * Branded numeric type representing the `NaN` value.
 * This type is branded to ensure type safety when handling NaN values.
 *
 * @example
 * ```ts
 * const checkNaN = (x: number): x is NaNType => Number.isNaN(x);
 *
 * const value: number = parseFloat("invalid");
 * if (checkNaN(value)) {
 *   const nan: NaNType = value;
 *   // Handle NaN case specifically
 * }
 * ```
 */
type NaNType = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  '!=0' | 'NaNValue',
  TSTypeForgeInternals.IntRangeKeys | '>=0' | 'Finite' | 'Int' | 'SafeInt'
>;

/**
 * Branded numeric type for all valid numbers (excluding `NaN`).
 * This is the base type for most numeric brands.
 *
 * @example
 * ```ts
 * const isValidNumber = (x: number): x is ValidNumber => !Number.isNaN(x);
 *
 * const process = (n: ValidNumber) => {
 *   // Can safely perform arithmetic without NaN checks
 *   return n * 2 + 1;
 * };
 * ```
 */
type ValidNumber = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  never,
  'NaNValue'
>;

/**
 * Branded numeric type for finite numbers.
 * Represents values that pass `Number.isFinite(x)` check.
 * Excludes `NaN`, `Infinity`, and `-Infinity`.
 *
 * @example
 * ```ts
 * const isFinite = (x: number): x is FiniteNumber => Number.isFinite(x);
 *
 * const safeDivide = (a: FiniteNumber, b: FiniteNumber): FiniteNumber | InfiniteNumber => {
 *   const result = a / b;
 *   return isFinite(result) ? result : result as InfiniteNumber;
 * };
 * ```
 */
type FiniteNumber = TSTypeForgeInternals.ExtendNumberBrand<
  ValidNumber,
  'Finite'
>;

/**
 * Branded numeric type for infinite values (`Infinity` or `-Infinity`).
 * Represents values that are valid numbers but not finite.
 *
 * @example
 * ```ts
 * const isInfinite = (x: number): x is InfiniteNumber =>
 *   !Number.isNaN(x) && !Number.isFinite(x);
 *
 * const checkOverflow = (x: number): FiniteNumber | InfiniteNumber => {
 *   if (isInfinite(x)) return x;
 *   return x as FiniteNumber;
 * };
 * ```
 */
type InfiniteNumber = TSTypeForgeInternals.ExtendNumberBrand<
  ValidNumber,
  '!=0',
  'Finite' | 'Int' | 'SafeInt'
>;

/**
 * Branded numeric type for non-zero numbers.
 * Represents values that are not equal to zero (including -0).
 *
 * @example
 * ```ts
 * const isNonZero = (x: number): x is NonZeroNumber => x !== 0;
 *
 * const safeDivide = (a: number, b: NonZeroNumber) => a / b;
 * // No division by zero possible
 *
 * const reciprocal = (x: NonZeroNumber) => 1 / x;
 * ```
 */
type NonZeroNumber = TSTypeForgeInternals.ExtendNumberBrand<ValidNumber, '!=0'>;

/**
 * Branded numeric type for non-negative numbers (x >= 0).
 * Includes zero and all positive numbers.
 *
 * @example
 * ```ts
 * const isNonNegative = (x: number): x is NonNegativeNumber => x >= 0;
 *
 * const sqrt = (x: NonNegativeNumber) => Math.sqrt(x);
 * // Safe square root without negative input
 *
 * const arrayIndex = (arr: readonly unknown[], i: NonNegativeNumber & Int) => arr[i];
 * ```
 */
type NonNegativeNumber = TSTypeForgeInternals.ExtendNumberBrand<
  ValidNumber,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31' | '>=0'
>;

/**
 * Branded numeric type for positive numbers (x > 0).
 * Excludes zero, includes only strictly positive values.
 *
 * @example
 * ```ts
 * const isPositive = (x: number): x is PositiveNumber => x > 0;
 *
 * const log = (x: PositiveNumber) => Math.log(x);
 * // Safe logarithm without non-positive input
 *
 * const scale = (value: number, factor: PositiveNumber) => value * factor;
 * ```
 */
type PositiveNumber = IntersectBrand<NonZeroNumber, NonNegativeNumber>;

/**
 * Branded numeric type for negative numbers (x < 0).
 * Excludes zero, includes only strictly negative values.
 *
 * @example
 * ```ts
 * const isNegative = (x: number): x is NegativeNumber => x < 0;
 *
 * const absoluteValue = (x: NegativeNumber): PositiveNumber =>
 *   Math.abs(x) as PositiveNumber;
 *
 * const debt = (amount: NegativeNumber) => ({ type: 'debt', amount });
 * ```
 */
type NegativeNumber = TSTypeForgeInternals.ExtendNumberBrand<
  NonZeroNumber,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32',
  '>=0'
>;

/**
 * Branded numeric type specifically for `Number.POSITIVE_INFINITY`.
 *
 * @example
 * ```ts
 * const isPosInfinity = (x: number): x is POSITIVE_INFINITY =>
 *   x === Number.POSITIVE_INFINITY;
 *
 * const handleLimit = (x: number): FiniteNumber | POSITIVE_INFINITY => {
 *   if (x > Number.MAX_VALUE) return Number.POSITIVE_INFINITY as POSITIVE_INFINITY;
 *   return x as FiniteNumber;
 * };
 * ```
 */
type POSITIVE_INFINITY = TSTypeForgeInternals.ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, PositiveNumber>,
  never,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32'
>;

/**
 * Branded numeric type specifically for `Number.NEGATIVE_INFINITY`.
 *
 * @example
 * ```ts
 * const isNegInfinity = (x: number): x is NEGATIVE_INFINITY =>
 *   x === Number.NEGATIVE_INFINITY;
 *
 * const handleUnderflow = (x: number): FiniteNumber | NEGATIVE_INFINITY => {
 *   if (x < -Number.MAX_VALUE) return Number.NEGATIVE_INFINITY as NEGATIVE_INFINITY;
 *   return x as FiniteNumber;
 * };
 * ```
 */
type NEGATIVE_INFINITY = TSTypeForgeInternals.ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, NegativeNumber>,
  never,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31'
>;

/**
 * Branded numeric type for finite non-zero numbers.
 * Combines the constraints of being finite and non-zero.
 *
 * @example
 * ```ts
 * const isNonZeroFinite = (x: number): x is NonZeroFiniteNumber =>
 *   Number.isFinite(x) && x !== 0;
 *
 * const rate = (distance: FiniteNumber, time: NonZeroFiniteNumber) =>
 *   distance / time; // Safe division, finite result
 * ```
 */
type NonZeroFiniteNumber = IntersectBrand<NonZeroNumber, FiniteNumber>;

/**
 * Branded numeric type for finite non-negative numbers.
 * Represents finite values greater than or equal to zero.
 *
 * @example
 * ```ts
 * const isNonNegativeFinite = (x: number): x is NonNegativeFiniteNumber =>
 *   Number.isFinite(x) && x >= 0;
 *
 * const distance = (x: NonNegativeFiniteNumber) => ({ meters: x });
 * const age = (years: NonNegativeFiniteNumber & Int) => ({ years });
 * ```
 */
type NonNegativeFiniteNumber = IntersectBrand<NonNegativeNumber, FiniteNumber>;

/**
 * Branded numeric type for finite positive numbers.
 * Represents finite values strictly greater than zero.
 *
 * @example
 * ```ts
 * const isPositiveFinite = (x: number): x is PositiveFiniteNumber =>
 *   Number.isFinite(x) && x > 0;
 *
 * const price = (amount: PositiveFiniteNumber) => ({ USD: amount });
 * const weight = (kg: PositiveFiniteNumber) => ({ kilograms: kg });
 * ```
 */
type PositiveFiniteNumber = IntersectBrand<PositiveNumber, FiniteNumber>;

/**
 * Branded numeric type for finite negative numbers.
 * Represents finite values strictly less than zero.
 *
 * @example
 * ```ts
 * const isNegativeFinite = (x: number): x is NegativeFiniteNumber =>
 *   Number.isFinite(x) && x < 0;
 *
 * const temperature = (celsius: NegativeFiniteNumber) =>
 *   ({ celsius, freezing: true });
 * ```
 */
type NegativeFiniteNumber = IntersectBrand<NegativeNumber, FiniteNumber>;

// integer types

/**
 * Branded numeric type for integers.
 * Represents values that pass `Number.isInteger(x)` check.
 *
 * @example
 * ```ts
 * const isInt = (x: number): x is Int => Number.isInteger(x);
 *
 * const getArrayElement = <T>(arr: readonly T[], index: Int & NonNegativeNumber) =>
 *   arr[index];
 *
 * const factorial = (n: Int & NonNegativeNumber): Int =>
 *   n === 0 ? 1 as Int : (n * factorial((n - 1) as Int & NonNegativeNumber)) as Int;
 * ```
 */
type Int = TSTypeForgeInternals.ExtendNumberBrand<FiniteNumber, 'Int'>;

/**
 * Branded numeric type for unsigned integers (non-negative integers).
 * Represents integers greater than or equal to zero.
 *
 * @example
 * ```ts
 * const isUint = (x: number): x is Uint =>
 *   Number.isInteger(x) && x >= 0;
 *
 * const arrayLength = (arr: readonly unknown[]): Uint =>
 *   arr.length as Uint;
 *
 * const repeat = (str: string, count: Uint) => str.repeat(count);
 * ```
 */
type Uint = IntersectBrand<Int, NonNegativeNumber>;

/**
 * Branded numeric type for positive integers.
 * Represents integers strictly greater than zero.
 *
 * @example
 * ```ts
 * const isPositiveInt = (x: number): x is PositiveInt =>
 *   Number.isInteger(x) && x > 0;
 *
 * const take = <T>(arr: readonly T[], n: PositiveInt): T[] =>
 *   arr.slice(0, n);
 *
 * const id = (value: PositiveInt) => ({ id: value });
 * ```
 */
type PositiveInt = IntersectBrand<Int, PositiveNumber>;

/**
 * Branded numeric type for negative integers.
 * Represents integers strictly less than zero.
 *
 * @example
 * ```ts
 * const isNegativeInt = (x: number): x is NegativeInt =>
 *   Number.isInteger(x) && x < 0;
 *
 * const offset = (value: NegativeInt) => ({ offset: value });
 * const depth = (level: NegativeInt) => ({ belowGround: -level });
 * ```
 */
type NegativeInt = IntersectBrand<Int, NegativeNumber>;

/**
 * Branded numeric type for non-zero integers.
 * Represents integers that are not equal to zero.
 *
 * @example
 * ```ts
 * const isNonZeroInt = (x: number): x is NonZeroInt =>
 *   Number.isInteger(x) && x !== 0;
 *
 * const modulo = (a: Int, b: NonZeroInt) => a % b;
 * const gcd = (a: NonZeroInt, b: NonZeroInt): NonZeroInt => {
 *   // Euclidean algorithm implementation
 *   return (b === 0 ? a : gcd(b, (a % b) as NonZeroInt)) as NonZeroInt;
 * };
 * ```
 */
type NonZeroInt = IntersectBrand<Int, NonZeroNumber>;

/**
 * Branded numeric type for safe integers.
 * Represents integers that can be exactly represented in JavaScript (±2^53 - 1).
 *
 * @example
 * ```ts
 * const isSafeInt = (x: number): x is SafeInt => Number.isSafeInteger(x);
 *
 * const safeMath = {
 *   add: (a: SafeInt, b: SafeInt): SafeInt | undefined => {
 *     const result = a + b;
 *     return isSafeInt(result) ? result : undefined;
 *   }
 * };
 * ```
 */
type SafeInt = TSTypeForgeInternals.ExtendNumberBrand<Int, 'SafeInt'>;

/**
 * Branded numeric type for safe unsigned integers.
 * Represents non-negative integers within the safe integer range.
 *
 * @example
 * ```ts
 * const isSafeUint = (x: number): x is SafeUint =>
 *   Number.isSafeInteger(x) && x >= 0;
 *
 * const fileSize = (bytes: SafeUint) => ({ bytes });
 * const timestamp = (): SafeUint => Date.now() as SafeUint;
 * ```
 */
type SafeUint = IntersectBrand<SafeInt, NonNegativeNumber>;

/**
 * Branded numeric type for positive safe integers.
 * Represents positive integers within the safe integer range.
 *
 * @example
 * ```ts
 * const isPositiveSafeInt = (x: number): x is PositiveSafeInt =>
 *   Number.isSafeInteger(x) && x > 0;
 *
 * const userId = (id: PositiveSafeInt) => ({ userId: id });
 * const port = (num: PositiveSafeInt & Uint16) => ({ port: num });
 * ```
 */
type PositiveSafeInt = IntersectBrand<SafeInt, PositiveNumber>;

/**
 * Branded numeric type for negative safe integers.
 * Represents negative integers within the safe integer range.
 *
 * @example
 * ```ts
 * const isNegativeSafeInt = (x: number): x is NegativeSafeInt =>
 *   Number.isSafeInteger(x) && x < 0;
 *
 * const priority = (level: NegativeSafeInt) => ({ priority: -level });
 * ```
 */
type NegativeSafeInt = IntersectBrand<SafeInt, NegativeNumber>;

/**
 * Branded numeric type for non-zero safe integers.
 * Represents safe integers that are not equal to zero.
 *
 * @example
 * ```ts
 * const isNonZeroSafeInt = (x: number): x is NonZeroSafeInt =>
 *   Number.isSafeInteger(x) && x !== 0;
 *
 * const step = (current: SafeInt, increment: NonZeroSafeInt): SafeInt =>
 *   (current + increment) as SafeInt;
 * ```
 */
type NonZeroSafeInt = IntersectBrand<SafeInt, NonZeroNumber>;

/**
 * Branded numeric type for 32-bit signed integers.
 * Range: [-2^31, 2^31 - 1] or [-2,147,483,648, 2,147,483,647]
 *
 * @example
 * ```ts
 * const isInt32 = (x: number): x is Int32 =>
 *   Number.isSafeInteger(x) && x >= -(2**31) && x <= 2**31 - 1;
 *
 * const toInt32 = (x: number): Int32 => {
 *   // Simulate 32-bit integer overflow
 *   return (x | 0) as Int32;
 * };
 *
 * const bitwiseOr = (a: Int32, b: Int32): Int32 => (a | b) as Int32;
 * ```
 */
type Int32 = TSTypeForgeInternals.ExtendNumberBrand<
  SafeInt,
  '< 2^31' | '< 2^32' | '> -2^32' | '>= -2^31'
>;

/**
 * Branded numeric type for 16-bit signed integers.
 * Range: [-2^15, 2^15 - 1] or [-32,768, 32,767]
 *
 * @example
 * ```ts
 * const isInt16 = (x: number): x is Int16 =>
 *   Number.isSafeInteger(x) && x >= -(2**15) && x <= 2**15 - 1;
 *
 * const audioSample = (value: Int16) => ({ sample: value });
 * const temperature = (celsius: Int16) => ({ celsius });
 * ```
 */
type Int16 = TSTypeForgeInternals.ExtendNumberBrand<
  Int32,
  '< 2^15' | '< 2^16' | '> -2^16' | '>= -2^15'
>;

/**
 * Branded numeric type for 32-bit unsigned integers.
 * Range: [0, 2^32 - 1] or [0, 4,294,967,295]
 *
 * @example
 * ```ts
 * const isUint32 = (x: number): x is Uint32 =>
 *   Number.isSafeInteger(x) && x >= 0 && x <= 2**32 - 1;
 *
 * const color = (rgba: Uint32) => ({ rgba });
 * const ipAddress = (ip: Uint32) => {
 *   // Convert to dotted decimal notation
 *   return `${ip >>> 24}.${(ip >>> 16) & 0xff}.${(ip >>> 8) & 0xff}.${ip & 0xff}`;
 * };
 * ```
 */
type Uint32 = TSTypeForgeInternals.ExtendNumberBrand<SafeUint, '< 2^32'>;

/**
 * Branded numeric type for 16-bit unsigned integers.
 * Range: [0, 2^16 - 1] or [0, 65,535]
 *
 * @example
 * ```ts
 * const isUint16 = (x: number): x is Uint16 =>
 *   Number.isSafeInteger(x) && x >= 0 && x <= 2**16 - 1;
 *
 * const port = (num: Uint16) => ({ port: num });
 * const characterCode = (code: Uint16) => String.fromCharCode(code);
 * ```
 */
type Uint16 = TSTypeForgeInternals.ExtendNumberBrand<
  Uint32,
  '< 2^16' | '< 2^31'
>;

/**
 * Branded numeric type for negative 32-bit integers.
 * Range: [-2^32 + 1, -1] or [-4,294,967,295, -1]
 *
 * @example
 * ```ts
 * const isNegativeInt32 = (x: number): x is NegativeInt32 =>
 *   Number.isSafeInteger(x) && x < 0 && x > -(2**32);
 *
 * const offset = (value: NegativeInt32) => ({ offset: value });
 * ```
 */
type NegativeInt32 = TSTypeForgeInternals.ExtendNumberBrand<
  IntersectBrand<SafeInt, NegativeNumber>,
  '> -2^32'
>;

/**
 * Branded numeric type for negative 16-bit integers.
 * Range: [-2^16 + 1, -1] or [-65,535, -1]
 *
 * @example
 * ```ts
 * const isNegativeInt16 = (x: number): x is NegativeInt16 =>
 *   Number.isSafeInteger(x) && x < 0 && x > -(2**16);
 *
 * const relativePosition = (offset: NegativeInt16) => ({ x: offset });
 * ```
 */
type NegativeInt16 = TSTypeForgeInternals.ExtendNumberBrand<
  NegativeInt32,
  '> -2^16' | '>= -2^31'
>;

/**
 * Branded numeric type for 32-bit floating point numbers.
 * Represents values that can be stored in a Float32Array.
 *
 * @example
 * ```ts
 * const toFloat32 = (x: number): Float32 => {
 *   const arr = new Float32Array([x]);
 *   return arr[0] as Float32;
 * };
 *
 * const shader = (vertices: Float32[]) => {
 *   // WebGL shader processing
 * };
 * ```
 */
type Float32 = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  'Float32'
>;

/**
 * Branded numeric type for 64-bit floating point numbers.
 * Represents values that can be stored in a Float64Array (standard JS number precision).
 *
 * @example
 * ```ts
 * const toFloat64 = (x: number): Float64 => x as Float64;
 *
 * const scientificData = (measurements: Float64[]) => {
 *   // High-precision calculations
 * };
 * ```
 */
type Float64 = TSTypeForgeInternals.ExtendNumberBrand<
  TSTypeForgeInternals.BrandedNumberBaseType,
  'Float64'
>;

/**
 * Branded bigint type for 64-bit signed integers.
 * Represents values that can be stored in a BigInt64Array.
 *
 * @example
 * ```ts
 * const toBigInt64 = (x: bigint): BigInt64 => {
 *   const min = -(2n ** 63n);
 *   const max = 2n ** 63n - 1n;
 *   if (x >= min && x <= max) return x as BigInt64;
 *   throw new Error('Out of BigInt64 range');
 * };
 * ```
 */
type BigInt64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigInt64'>;

/**
 * Branded bigint type for 64-bit unsigned integers.
 * Represents values that can be stored in a BigUint64Array.
 *
 * @example
 * ```ts
 * const toBigUint64 = (x: bigint): BigUint64 => {
 *   const max = 2n ** 64n - 1n;
 *   if (x >= 0n && x <= max) return x as BigUint64;
 *   throw new Error('Out of BigUint64 range');
 * };
 * ```
 */
type BigUint64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigUint64'>;

/**
 * Union type of small integer literals for type-level operations.
 * Provides literal integer types within a small range for precise typing.
 *
 * @template T - Constraint specifying which integers to include:
 *   - `''`    : All integers in `[-MaxIndex, MaxIndex - 1]`
 *   - `'!=0'` : All integers except 0
 *   - `'<0'`  : Negative integers only `[-MaxIndex, -1]`
 *   - `'<=0'` : Non-positive integers `[-MaxIndex, 0]`
 *   - `'>0'`  : Positive integers only `[1, MaxIndex - 1]`
 *   - `'>=0'` : Non-negative integers `[0, MaxIndex - 1]`
 * @template MaxIndex - Maximum absolute value for the range (default: 40)
 *
 * @example
 * ```ts
 * type DiceValue = SmallInt<'>0', 7>; // 1 | 2 | 3 | 4 | 5 | 6
 * type Temperature = SmallInt<'', 101>; // -100 to 100
 * type Countdown = SmallInt<'>=0', 11>; // 0 | 1 | 2 | ... | 10
 * type Offset = SmallInt<'!=0', 6>; // -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5
 * ```
 */
type SmallInt<
  T extends '!=0' | '' | '<=0' | '<0' | '>=0' | '>0' = '',
  MaxIndex extends number = TSTypeForgeInternals.SmallIntIndexMax,
> =
  TypeEq<T, '<=0'> extends true
    ? TSTypeForgeInternals.SmallNegativeInt<MaxIndex> | 0
    : TypeEq<T, '<0'> extends true
      ? TSTypeForgeInternals.SmallNegativeInt<MaxIndex>
      : TypeEq<T, '>=0'> extends true
        ? TSTypeForgeInternals.SmallPositiveInt<MaxIndex> | 0
        : TypeEq<T, '>0'> extends true
          ? TSTypeForgeInternals.SmallPositiveInt<MaxIndex>
          : TypeEq<T, '!=0'> extends true
            ?
                | TSTypeForgeInternals.SmallNegativeInt<MaxIndex>
                | TSTypeForgeInternals.SmallPositiveInt<MaxIndex>
            : TypeEq<T, ''> extends true
              ?
                  | TSTypeForgeInternals.SmallNegativeInt<MaxIndex>
                  | TSTypeForgeInternals.SmallPositiveInt<MaxIndex>
                  | 0
              : never;

/**
 * Union type of small non-negative integer literals.
 * Convenience type for `SmallInt<'>=0'>`.
 *
 * @example
 * ```ts
 * type Index = SmallUint; // 0 | 1 | 2 | ... | 39
 * const getItem = <T>(arr: readonly T[], i: Index) => arr[i];
 * ```
 */
type SmallUint = SmallInt<'>=0'>;

/**
 * Utility type that filters only integer branded types.
 * Returns the input type if it extends Int, otherwise returns never.
 *
 * @template T - Type to check and cast
 * @returns T if T extends Int, otherwise never
 *
 * @example
 * ```ts
 * type A = CastToInt<Int>; // Int
 * type B = CastToInt<FiniteNumber>; // never
 * type C = CastToInt<SafeInt>; // SafeInt (since SafeInt extends Int)
 * ```
 */
type CastToInt<T> = T extends Int ? T : never;

/**
 * Enhances an integer brand type with literal values for small integers.
 * This enables more precise typing for small integer values while maintaining
 * the brand for larger values.
 *
 * @template N - The integer brand type to enhance
 * @template MaxIndex - Maximum absolute value for literals (default: 40)
 * @returns Union of literal integers and the branded type
 *
 * @example
 * ```ts
 * type Count = WithSmallInt<Uint>;
 * // Count is 0 | 1 | 2 | ... | 39 | Uint
 *
 * const increment = (n: Count): Count => {
 *   if (typeof n === 'number' && n < 39) {
 *     return (n + 1) as Count; // Type narrowing works with literals
 *   }
 *   return (n as number + 1) as Count;
 * };
 *
 * // Common patterns:
 * type SmallInt = WithSmallInt<Int>;              // -40 to 39 | Int
 * type SmallUint = WithSmallInt<Uint>;            // 0 to 39 | Uint
 * type SmallPositiveInt = WithSmallInt<PositiveInt>; // 1 to 39 | PositiveInt
 * ```
 */
type WithSmallInt<
  N extends Int,
  MaxIndex extends number = TSTypeForgeInternals.SmallIntIndexMax,
> = TSTypeForgeInternals.WithSmallIntImpl<
  CastToInt<NormalizeBrandUnion<N>>,
  MaxIndex
>;

/**
 * Integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | Int`
 */
type IntWithSmallInt = WithSmallInt<Int>;

/**
 * Safe integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | SafeInt`
 */
type SafeIntWithSmallInt = WithSmallInt<SafeInt>;

/**
 * Unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | Uint`
 */
type UintWithSmallInt = WithSmallInt<Uint>;

/**
 * Safe unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | SafeUint`
 */
type SafeUintWithSmallInt = WithSmallInt<SafeUint>;

/**
 * Positive integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveInt`
 */
type PositiveIntWithSmallInt = WithSmallInt<PositiveInt>;

/**
 * Positive safe integer type with small literal values included.
 * Type: `1 | 2 | ... | 39 | PositiveSafeInt`
 */
type PositiveSafeIntWithSmallInt = WithSmallInt<PositiveSafeInt>;

/**
 * Negative integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeInt`
 */
type NegativeIntWithSmallInt = WithSmallInt<NegativeInt>;

/**
 * Negative safe integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeSafeInt`
 */
type NegativeSafeIntWithSmallInt = WithSmallInt<NegativeSafeInt>;

/**
 * Non-zero integer type with small literal values included.
 * Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroInt`
 */
type NonZeroIntWithSmallInt = WithSmallInt<NonZeroInt>;

/**
 * Non-zero safe integer type with small literal values included.
 * Type: `-40 | ... | -1 | 1 | ... | 39 | NonZeroSafeInt`
 */
type NonZeroSafeIntWithSmallInt = WithSmallInt<NonZeroSafeInt>;

/**
 * 32-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | Int32`
 */
type Int32WithSmallInt = WithSmallInt<Int32>;

/**
 * 16-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | 39 | Int16`
 */
type Int16WithSmallInt = WithSmallInt<Int16>;

/**
 * 32-bit unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | Uint32`
 */
type Uint32WithSmallInt = WithSmallInt<Uint32>;

/**
 * 16-bit unsigned integer type with small literal values included.
 * Type: `0 | 1 | ... | 39 | Uint16`
 */
type Uint16WithSmallInt = WithSmallInt<Uint16>;

/**
 * Negative 32-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeInt32`
 */
type NegativeInt32WithSmallInt = WithSmallInt<NegativeInt32>;

/**
 * Negative 16-bit integer type with small literal values included.
 * Type: `-40 | -39 | ... | -1 | NegativeInt16`
 */
type NegativeInt16WithSmallInt = WithSmallInt<NegativeInt16>;

/**
 * Removes small integer literals from an integer type enhanced with WithSmallInt.
 * Useful for converting back to pure branded types.
 *
 * @template N - Integer type with small literals to remove from
 * @template MaxIndex - Maximum absolute value of literals to remove (default: 40)
 * @returns The branded type without literal values
 *
 * @example
 * ```ts
 * type Count = WithSmallInt<Uint>; // 0 | 1 | ... | 39 | Uint
 * type PureCount = RemoveSmallInt<Count>; // Uint
 *
 * const toLargeCount = (n: Count): RemoveSmallInt<Count> => {
 *   if (typeof n === 'number') {
 *     return (n + 1000) as Uint; // Convert small to large
 *   }
 *   return n;
 * };
 * ```
 */
type RemoveSmallInt<
  N extends IntWithSmallInt,
  MaxIndex extends number = TSTypeForgeInternals.SmallIntIndexMax,
> = RelaxedExclude<N, SmallInt<'', MaxIndex>>;
