import { expectType } from '../expect-type.mjs';
import { pipe } from '../functional/index.mjs';
import { Num } from './num.mjs';

export namespace RefinedNumberUtils {
  const castType =
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

  export type ToNonNegative<N extends UnknownNumberBrand> = IntersectBrand<
    N,
    NonNegativeNumber
  >;

  export type RemoveNonZeroBrandKey<N extends UnknownNumberBrand> = Brand<
    GetBrandValuePart<N>,
    RelaxedExclude<UnwrapBrandTrueKeys<N>, '!=0'> & string,
    UnwrapBrandFalseKeys<N> & string
  >;

  type CastToInt<N> = N extends Int ? N : never;

  export type NumberClass<
    N extends UnknownNumberBrand,
    classes extends 'int' | 'non-negative' | 'positive' | 'range',
  > = Readonly<
    ('int' extends classes
      ? unknown
      : 'positive' extends classes
        ? {
            floor: (x: N, y: N) => RemoveNonZeroBrandKey<ToInt<N>>;
            ceil: (x: N, y: N) => ToInt<N>;
            round: (x: N, y: N) => RemoveNonZeroBrandKey<ToInt<N>>;
          }
        : {
            floor: (x: N, y: N) => ToInt<N>;
            ceil: (x: N, y: N) => ToInt<N>;
            round: (x: N, y: N) => ToInt<N>;
          }) &
      ('non-negative' extends classes
        ? {
            MIN_VALUE: number;
            clamp: (a: number) => N;
          }
        : unknown) &
      ('non-negative' extends classes
        ? unknown
        : 'positive' extends classes
          ? unknown
          : {
              abs: (x: N) => ToNonNegative<N>;
            }) &
      ('positive' extends classes
        ? {
            MIN_VALUE: number;
            clamp: (a: number) => N;
          }
        : unknown) &
      ('range' extends classes
        ? {
            MIN_VALUE: number;
            MAX_VALUE: number;
            clamp: (a: number) => N;
          }
        : unknown) & {
        is: (a: number) => a is N;
        min: (...values: readonly N[]) => N;
        max: (...values: readonly N[]) => N;
        random: (min: N, max: N) => N;
        pow: (x: N, y: N) => N;
        add: (x: N, y: N) => N;
        sub: (x: N, y: N) => N;
        mul: (x: N, y: N) => N;
        div: (x: N, y: ToNonZero<N>) => N;
      }
  >;

  if (import.meta.vitest !== undefined) {
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

    test('dummy', () => {
      expect(true).toBe(true);
    });
  }

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
    MIN_VALUE extends number | undefined,
    MAX_VALUE extends number | undefined,
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
      min: ElementTypeWithSmallInt,
      max: ElementTypeWithSmallInt,
    ) => ElementType;

    randomNonZero: (
      min: ElementTypeWithSmallInt,
      max: ElementTypeWithSmallInt,
    ) => ElementType;

    castTo: <N extends number>(x: N) => ElementType & N;

    clamp: TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
      ? undefined
      : (x: number) => ElementType;
  }>;

  export const operatorsForInteger = <
    ElementType extends Int,
    MIN_VALUE extends number | undefined,
    MAX_VALUE extends number | undefined,
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

    const castTo = castType<ElementType>(is, typeNameInMessage);

    const clamp: ((a: number) => ElementType) | undefined = pipe(
      clampFnOrUndefined(MIN_VALUE, MAX_VALUE),
    ).chainOptional(
      (cl) =>
        (x: number): ElementType =>
          castTo(Math.round(cl(x))),
    ).value;

    const clampOrCastFn: (a: number) => ElementType = clamp ?? castTo;

    const abs = (x: ElementTypeWithSmallInt): ToNonNegative<ElementType> =>
      Math.abs(clampOrCastFn(x));

    const min_ = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
      clampOrCastFn(Math.min(...values));

    const max_ = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
      clampOrCastFn(Math.max(...values));

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
      min: ElementTypeWithSmallInt,
      max: ElementTypeWithSmallInt,
    ): number =>
      min + Math.floor((Math.max(max, min) - min + 1) * Math.random());

    // [-5, 5] -> floor(11 * Math.random()) + (-5)
    const random = (
      min: ElementTypeWithSmallInt,
      max: ElementTypeWithSmallInt,
    ): ElementType => clampOrCastFn(randomImpl(min, max));

    const randomNonZero = (
      min: ElementTypeWithSmallInt,
      max: ElementTypeWithSmallInt,
    ): ElementType => {
      // eslint-disable-next-line no-constant-condition
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
      castTo,

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
    random: (min: ElementType, max: ElementType) => ElementType;
    randomNonZero: (min: ElementType, max: ElementType) => ElementType;

    castTo: <N extends number>(x: N) => ElementType & N;

    clamp: TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
      ? undefined
      : (x: number) => ElementType;
  }>;

  export const operatorsForFloat = <
    ElementType extends UnknownNumberBrand,
    MIN_VALUE extends number | undefined,
    MAX_VALUE extends number | undefined,
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

    const castTo = castType<ElementType>(is, typeNameInMessage);

    const clamp: ((a: number) => ElementType) | undefined = pipe(
      clampFnOrUndefined(MIN_VALUE, MAX_VALUE),
    ).chainOptional(
      (cl) =>
        (x: number): ElementType =>
          castTo(cl(x)),
    ).value;

    const clampOrCastFn: (a: number) => ElementType = clamp ?? castTo;

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
      clampOrCastFn(
        // eslint-disable-next-line total-functions/no-partial-division
        x / y,
      );

    const random = (min: ElementType, max: ElementType): ElementType =>
      clampOrCastFn(min + (Math.max(max, min) - min) * Math.random());

    const randomNonZero = (min: ElementType, max: ElementType): ElementType => {
      // eslint-disable-next-line no-constant-condition
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
      castTo,

      clamp:
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        clamp as TypeEq<MAX_VALUE | MIN_VALUE, undefined> extends true
          ? undefined
          : (x: number) => ElementType,
    } as const;
  };
}
