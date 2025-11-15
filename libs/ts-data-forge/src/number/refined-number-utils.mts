import { expectType } from '../expect-type.mjs';
import { pipe } from '../functional/index.mjs';
import { Num } from './num.mjs';

/** @internal */
export namespace TsDataForgeInternals {
  /**
   * Internal utilities for creating and managing refined (branded) number
   * types.
   *
   * This namespace provides factory functions and type utilities for building
   * type-safe numeric operations with compile-time constraints. It serves as
   * the foundation for all branded number types in the library, including:
   *
   * - Integer types (Int, SafeInt, Int8, Int16, Int32)
   * - Unsigned types (UInt, UInt8, UInt16, UInt32)
   * - Constrained types (NonZero, NonNegative, Positive)
   * - Range-bounded types
   *
   * The utilities handle:
   *
   * - Type validation and narrowing
   * - Arithmetic operations that preserve type constraints
   * - Automatic clamping for bounded types
   * - Random number generation within type bounds
   *
   * @internal This namespace is not part of the public API
   */
  export namespace RefinedNumberUtils {
    const castTypeImpl =
      <BrandedType extends number>(
        is: (n: number) => n is BrandedType,
        typeNameInErrorMessage: string,
      ) =>
      <N extends number>(a: N): BrandedType & N => {
        if (!is(a)) {
          throw new TypeError(`Expected ${typeNameInErrorMessage}, got: ${a}`);
        }

        return a;
      };

    type UnknownNumberBrand = ChangeBaseBrand<UnknownBrand, number>;

    /**
     * Converts a branded number type to include the Int brand.
     *
     * @template N - A branded number type
     * @internal
     */
    export type ToInt<N extends UnknownNumberBrand> = IntersectBrand<N, Int>;

    type ToNonZero<N extends UnknownNumberBrand> = IntersectBrand<
      N,
      NonZeroNumber
    >;

    const isNonZero = <N extends UnknownNumberBrand>(
      n: N,
    ): n is N & ToNonZero<N> => n !== 0;

    type ToNonZeroIntWithSmallInt<N extends Int> = WithSmallInt<
      CastToInt<ToNonZero<N>>
    >;

    /**
     * Converts a branded number type to include the NonNegativeNumber brand.
     *
     * @template N - A branded number type
     * @internal
     */
    export type ToNonNegative<N extends UnknownNumberBrand> = IntersectBrand<
      N,
      NonNegativeNumber
    >;

    /**
     * Removes the non-zero brand constraint from a branded number type. Used
     * when operations may produce zero values.
     *
     * @template N - A branded number type
     * @internal
     */
    export type RemoveNonZeroBrandKey<N extends UnknownNumberBrand> = Brand<
      GetBrandValuePart<N>,
      RelaxedExclude<UnwrapBrandTrueKeys<N>, '!=0'> & string,
      UnwrapBrandFalseKeys<N> & string
    >;

    type CastToInt<N> = N extends Int ? N : never;

    /**
     * Generates a type-safe API for a branded number type based on its
     * characteristics.
     *
     * This type dynamically constructs an object type with appropriate methods
     * based on the number class. For example:
     *
     * - Integer types don't get floor/ceil/round methods
     * - Non-negative types don't get abs method
     * - Range-bounded types get MIN_VALUE/MAX_VALUE constants
     *
     * @template N - The branded number type
     * @template classes - Union of characteristics: 'int' | 'non-negative' |
     *   'positive' | 'range'
     * @internal
     */
    export type NumberClass<
      N extends UnknownNumberBrand,
      classes extends 'int' | 'non-negative' | 'positive' | 'range',
    > = ('int' extends classes
      ? unknown
      : 'positive' extends classes
        ? Readonly<{
            floor: (x: N, y: N) => RemoveNonZeroBrandKey<ToInt<N>>;
            ceil: (x: N, y: N) => ToInt<N>;
            round: (x: N, y: N) => RemoveNonZeroBrandKey<ToInt<N>>;
          }>
        : Readonly<{
            floor: (x: N, y: N) => ToInt<N>;
            ceil: (x: N, y: N) => ToInt<N>;
            round: (x: N, y: N) => ToInt<N>;
          }>) &
      ('non-negative' extends classes
        ? Readonly<{
            MIN_VALUE: number;
            clamp: (a: number) => N;
          }>
        : unknown) &
      ('non-negative' extends classes
        ? unknown
        : 'positive' extends classes
          ? unknown
          : Readonly<{
              abs: (x: N) => ToNonNegative<N>;
            }>) &
      ('positive' extends classes
        ? Readonly<{
            MIN_VALUE: number;
            clamp: (a: number) => N;
          }>
        : unknown) &
      ('range' extends classes
        ? Readonly<{
            MIN_VALUE: number;
            MAX_VALUE: number;
            clamp: (a: number) => N;
          }>
        : unknown) &
      Readonly<{
        is: (a: number) => a is N;
        min: (...values: readonly N[]) => N;
        max: (...values: readonly N[]) => N;
        random: (min: N, max: N) => N;
        pow: (x: N, y: N) => N;
        add: (x: N, y: N) => N;
        sub: (x: N, y: N) => N;
        mul: (x: N, y: N) => N;
        div: (x: N, y: ToNonZero<N>) => N;
      }>;

    type BaseKeys =
      | 'add'
      | 'div'
      | 'is'
      | 'max'
      | 'min'
      | 'mul'
      | 'pow'
      | 'random'
      | 'sub';

    type FloatMethods = 'ceil' | 'floor' | 'round';

    expectType<keyof NumberClass<UnknownNumberBrand, 'int'>, BaseKeys | 'abs'>(
      '=',
    );

    expectType<
      keyof NumberClass<UnknownNumberBrand, never>,
      BaseKeys | FloatMethods | 'abs'
    >('=');

    expectType<
      keyof NumberClass<UnknownNumberBrand, 'non-negative'>,
      BaseKeys | FloatMethods | 'clamp' | 'MIN_VALUE'
    >('=');

    expectType<
      keyof NumberClass<UnknownNumberBrand, 'positive'>,
      BaseKeys | FloatMethods | 'clamp' | 'MIN_VALUE'
    >('=');

    expectType<
      keyof NumberClass<UnknownNumberBrand, 'int' | 'range'>,
      BaseKeys | 'abs' | 'clamp' | 'MAX_VALUE' | 'MIN_VALUE'
    >('=');

    const isFnOrUndefined = (
      min: number | undefined,
      max: number | undefined,
    ): ((n: number) => boolean) | undefined =>
      min === undefined
        ? max === undefined
          ? undefined
          : (n) => n <= max
        : max === undefined
          ? (n) => min <= n
          : Num.isInRangeInclusive(min, max);

    const clampFnOrUndefined = (
      min: number | undefined,
      max: number | undefined,
    ): ((n: number) => number) | undefined =>
      min === undefined
        ? max === undefined
          ? undefined
          : (n) => Math.min(max, n)
        : max === undefined
          ? (n) => Math.max(min, n)
          : Num.clamp(min, max);

    type OperatorsForInteger<
      ElementType extends Int,
      MIN_VALUE extends number,
      MAX_VALUE extends number,
      ElementTypeWithSmallInt extends
        WithSmallInt<ElementType> = WithSmallInt<ElementType>,
    > = Readonly<{
      MIN_VALUE: MIN_VALUE;
      MAX_VALUE: MAX_VALUE;

      is: (a: number) => a is ElementType;

      abs: (x: ElementTypeWithSmallInt) => ToNonNegative<ElementType>;

      min: (...values: readonly ElementTypeWithSmallInt[]) => ElementType;

      max: (...values: readonly ElementTypeWithSmallInt[]) => ElementType;

      pow: (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ) => ElementType;

      add: (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ) => ElementType;

      sub: (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ) => ElementType;

      mul: (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ) => ElementType;

      div: (
        x: ElementTypeWithSmallInt,
        y: ToNonZeroIntWithSmallInt<ElementType>,
      ) => ElementType;

      random: (
        min?: ElementTypeWithSmallInt,
        max?: ElementTypeWithSmallInt,
      ) => ElementType;

      randomNonZero: (
        min?: ElementTypeWithSmallInt,
        max?: ElementTypeWithSmallInt,
      ) => ElementType;

      castType: <N extends number>(x: N) => ElementType & N;

      clamp: TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
        ? undefined
        : (x: number) => ElementType;
    }>;

    /**
     * Factory function that creates a complete set of type-safe operations for
     * integer types.
     *
     * This function generates:
     *
     * - Type guards and validators
     * - Arithmetic operations that preserve type constraints
     * - Utility functions (min, max, abs, random)
     * - Automatic clamping for bounded types
     *
     * All operations ensure results remain within the type's constraints, using
     * clamping when bounds are specified.
     *
     * @example
     *
     * ```ts
     * const intOps = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
     *   SafeInt,
     *   number,
     *   number
     * >({
     *   integerOrSafeInteger: 'SafeInteger',
     *   MIN_VALUE: Number.MIN_SAFE_INTEGER,
     *   MAX_VALUE: Number.MAX_SAFE_INTEGER,
     *   typeNameInMessage: 'SafeInt',
     * } as const);
     *
     * const six = intOps.castType(6);
     *
     * const four = intOps.castType(4);
     *
     * const sum = intOps.add(six, four);
     *
     * const difference = intOps.sub(six, four);
     *
     * const product = intOps.mul(six, four);
     *
     * const quotient = intOps.div(six, intOps.castType(2));
     *
     * const roundedClamp = intOps.clamp(1.5);
     *
     * const randomValue = intOps.random();
     *
     * assert(sum === 10);
     *
     * assert(difference === 2);
     *
     * assert(product === 24);
     *
     * assert(quotient === 3);
     *
     * assert(roundedClamp === 2);
     *
     * assert.ok(Number.isSafeInteger(randomValue));
     * ```
     *
     * @template ElementType - The integer branded type
     * @template MIN_VALUE - Optional minimum value for bounded types
     * @template MAX_VALUE - Optional maximum value for bounded types
     * @param config - Configuration object
     * @param config.integerOrSafeInteger - Whether to use Number.isInteger or
     *   Number.isSafeInteger
     * @param config.nonZero - If true, excludes zero from valid values
     * @param config.MIN_VALUE - Minimum valid value (inclusive)
     * @param config.MAX_VALUE - Maximum valid value (inclusive)
     * @param config.typeNameInMessage - Human-readable type name for error
     *   messages
     * @returns Object containing all type-safe operations for the integer type
     * @internal
     */
    export const operatorsForInteger = <
      ElementType extends Int,
      MIN_VALUE extends number,
      MAX_VALUE extends number,
    >({
      integerOrSafeInteger,
      nonZero,
      MIN_VALUE,
      MAX_VALUE,
      typeNameInMessage,
    }: Readonly<{
      integerOrSafeInteger: 'Integer' | 'SafeInteger';
      nonZero?: boolean;
      MIN_VALUE: MIN_VALUE;
      MAX_VALUE: MAX_VALUE;
      typeNameInMessage: string;
    }>): OperatorsForInteger<ElementType, MIN_VALUE, MAX_VALUE> => {
      type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

      const is = (a: number): a is ElementType =>
        (integerOrSafeInteger === 'Integer'
          ? Number.isInteger(a)
          : Number.isSafeInteger(a)) &&
        (nonZero === true ? a !== 0 : true) &&
        (isFnOrUndefined(MIN_VALUE, MAX_VALUE)?.(a) ?? true);

      const castType = castTypeImpl<ElementType>(is, typeNameInMessage);

      const clamp: ((a: number) => ElementType) | undefined = pipe(
        clampFnOrUndefined(MIN_VALUE, MAX_VALUE),
      ).mapNullable(
        (cl) =>
          (x: number): ElementType =>
            castType(Math.round(cl(x))),
      ).value;

      const clampOrCastFn: (a: number) => ElementType = clamp ?? castType;

      const abs = (x: ElementTypeWithSmallInt): ToNonNegative<ElementType> =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Math.abs(clampOrCastFn(x)) as ToNonNegative<ElementType>;

      const min_ = (
        ...values: readonly ElementTypeWithSmallInt[]
      ): ElementType => clampOrCastFn(Math.min(...values));

      const max_ = (
        ...values: readonly ElementTypeWithSmallInt[]
      ): ElementType => clampOrCastFn(Math.max(...values));

      const pow = (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ): ElementType => clampOrCastFn(x ** y);

      const add = (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ): ElementType => clampOrCastFn(x + y);

      const sub = (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ): ElementType => clampOrCastFn(x - y);

      const mul = (
        x: ElementTypeWithSmallInt,
        y: ElementTypeWithSmallInt,
      ): ElementType => clampOrCastFn(x * y);

      const div = (
        x: ElementTypeWithSmallInt,
        y: ToNonZeroIntWithSmallInt<ElementType>,
      ): ElementType =>
        clampOrCastFn(
          Math.floor(
            // eslint-disable-next-line total-functions/no-partial-division
            x / y,
          ),
        );

      const randomImpl = (
        min: number = MIN_VALUE,
        max: number = MAX_VALUE,
      ): number =>
        min + Math.floor((Math.max(max, min) - min + 1) * Math.random());

      // [-5, 5] -> floor(11 * Math.random()) + (-5)
      const random = (
        min?: ElementTypeWithSmallInt,
        max?: ElementTypeWithSmallInt,
      ): ElementType => clampOrCastFn(randomImpl(min, max));

      const randomNonZero = (
        min?: ElementTypeWithSmallInt,
        max?: ElementTypeWithSmallInt,
      ): ElementType => {
        while (true) {
          const r = randomImpl(min, max);

          if (Num.isNonZero(r)) return clampOrCastFn(r);
        }
      };

      return {
        MIN_VALUE,
        MAX_VALUE,
        is,
        abs,
        min: min_,
        max: max_,
        pow,
        add,
        sub,
        mul,
        div,
        random,
        randomNonZero,
        castType,

        clamp:
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          clamp as TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
            ? undefined
            : (x: number) => ElementType,
      } as const;
    };

    type OperatorsForFloat<
      ElementType extends UnknownNumberBrand,
      MIN_VALUE extends number | undefined,
      MAX_VALUE extends number | undefined,
    > = Readonly<{
      MIN_VALUE: MIN_VALUE;
      MAX_VALUE: MAX_VALUE;

      is: (a: number) => a is ElementType;

      abs: (x: ElementType) => ToNonNegative<ElementType>;
      min: (...values: readonly ElementType[]) => ElementType;
      max: (...values: readonly ElementType[]) => ElementType;
      pow: (x: ElementType, y: ElementType) => ElementType;
      add: (x: ElementType, y: ElementType) => ElementType;
      sub: (x: ElementType, y: ElementType) => ElementType;
      mul: (x: ElementType, y: ElementType) => ElementType;
      div: (x: ElementType, y: ToNonZero<ElementType>) => ElementType;
      random: (min?: ElementType, max?: ElementType) => ElementType;
      randomNonZero: (min?: ElementType, max?: ElementType) => ElementType;

      castType: <N extends number>(x: N) => ElementType & N;

      clamp: TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
        ? undefined
        : (x: number) => ElementType;
    }>;

    /**
     * Factory function that creates a complete set of type-safe operations for
     * floating-point types.
     *
     * This function generates:
     *
     * - Type guards and validators (checking for finite values)
     * - Arithmetic operations that preserve type constraints
     * - Utility functions (min, max, abs, random)
     * - Automatic clamping for bounded types
     *
     * All operations ensure results remain finite and within any specified
     * bounds. Division by zero is prevented through type constraints.
     *
     * @example
     *
     * ```ts
     * const floatOps = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
     *   PositiveFiniteNumber,
     *   number,
     *   number
     * >({
     *   nonZero: true,
     *   MIN_VALUE: Number.MIN_VALUE,
     *   MAX_VALUE: Number.MAX_VALUE,
     *   typeNameInMessage: 'PositiveFiniteNumber',
     * } as const);
     *
     * const fortyTwo = floatOps.castType(42.5);
     *
     * const seven = floatOps.castType(7.5);
     *
     * const sum = floatOps.add(fortyTwo, seven);
     *
     * const ratio = floatOps.div(sum, floatOps.castType(10));
     *
     * const clamped = floatOps.clamp(0);
     *
     * const boundedRandom = floatOps.random(
     *   floatOps.castType(10),
     *   floatOps.castType(20),
     * );
     *
     * const nonZeroRandom = floatOps.randomNonZero();
     *
     * assert(sum === 50);
     *
     * assert(ratio === 5);
     *
     * assert.ok(clamped >= Number.MIN_VALUE);
     *
     * assert.ok(boundedRandom >= 10 && boundedRandom <= 20);
     *
     * assert.ok(nonZeroRandom > 0);
     * ```
     *
     * @template ElementType - The floating-point branded type
     * @template MIN_VALUE - Optional minimum value for bounded types
     * @template MAX_VALUE - Optional maximum value for bounded types
     * @param config - Configuration object
     * @param config.nonZero - If true, excludes zero from valid values
     * @param config.MIN_VALUE - Minimum valid value (inclusive)
     * @param config.MAX_VALUE - Maximum valid value (inclusive)
     * @param config.typeNameInMessage - Human-readable type name for error
     *   messages
     * @returns Object containing all type-safe operations for the
     *   floating-point type
     * @internal
     */
    export const operatorsForFloat = <
      ElementType extends UnknownNumberBrand,
      MIN_VALUE extends number,
      MAX_VALUE extends number,
    >({
      nonZero,
      MIN_VALUE,
      MAX_VALUE,
      typeNameInMessage,
    }: Readonly<{
      nonZero?: boolean;
      MIN_VALUE: MIN_VALUE;
      MAX_VALUE: MAX_VALUE;
      typeNameInMessage: string;
    }>): OperatorsForFloat<ElementType, MIN_VALUE, MAX_VALUE> => {
      const is = (a: number): a is ElementType =>
        Number.isFinite(a) &&
        (nonZero === true ? a !== 0 : true) &&
        (isFnOrUndefined(MIN_VALUE, MAX_VALUE)?.(a) ?? true);

      const castType = castTypeImpl<ElementType>(is, typeNameInMessage);

      const clamp: ((a: number) => ElementType) | undefined = pipe(
        clampFnOrUndefined(MIN_VALUE, MAX_VALUE),
      ).mapNullable(
        (cl) =>
          (x: number): ElementType =>
            castType(cl(x)),
      ).value;

      const clampOrCastFn: (a: number) => ElementType = clamp ?? castType;

      const abs = (x: ElementType): ToNonNegative<ElementType> =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Math.abs(x) as ToNonNegative<ElementType>;

      const min_ = (...values: readonly ElementType[]): ElementType =>
        clampOrCastFn(Math.min(...values));

      const max_ = (...values: readonly ElementType[]): ElementType =>
        clampOrCastFn(Math.max(...values));

      const pow = (x: ElementType, y: ElementType): ElementType =>
        clampOrCastFn(x ** y);

      const add = (x: ElementType, y: ElementType): ElementType =>
        clampOrCastFn(x + y);

      const sub = (x: ElementType, y: ElementType): ElementType =>
        clampOrCastFn(x - y);

      const mul = (x: ElementType, y: ElementType): ElementType =>
        clampOrCastFn(x * y);

      const div = (x: ElementType, y: ToNonZero<ElementType>): ElementType =>
        // eslint-disable-next-line total-functions/no-partial-division
        clampOrCastFn(x / y);

      const randomImpl = (
        min: number = MIN_VALUE,
        max: number = MAX_VALUE,
      ): number => min + (Math.max(max, min) - min) * Math.random();

      const random = (min?: ElementType, max?: ElementType): ElementType =>
        clampOrCastFn(randomImpl(min, max));

      const randomNonZero = (
        min?: ElementType,
        max?: ElementType,
      ): ElementType => {
        while (true) {
          const r = random(min, max);

          if (isNonZero(r)) return r;
        }
      };

      return {
        MIN_VALUE,
        MAX_VALUE,
        is,
        abs,
        min: min_,
        max: max_,
        pow,
        add,
        sub,
        mul,
        div,
        random,
        randomNonZero,
        castType,

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        clamp: clamp as TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
          ? undefined
          : (x: number) => ElementType,
      } as const;
    };
  }
}
