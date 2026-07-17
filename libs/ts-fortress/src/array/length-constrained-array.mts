import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
  type SupportedLength,
} from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';

export type {
  BoundedLengthArray,
  FixedLengthArray,
  MaxLengthArray,
  MinLengthArray,
} from 'ts-type-forge';

/**
 * Creates a `Type` for a readonly array with exactly `size` elements, typed as
 * the branded {@link FixedLengthArray} instead of the structural tuple type
 * produced by `fixedLengthTuple`.
 *
 * Because the length constraint lives only in the brand, the element type is
 * never expanded into tuple positions, which keeps type-checking cheap even
 * when `A` is a large type. Prefer this over `fixedLengthTuple` when `A` is
 * large; prefer `fixedLengthTuple` when positional element types or a literal
 * `length` are needed.
 */
export function fixedLengthArray<A, N extends SupportedLength>(
  size: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: FixedLengthArray<N, A>;
    }>
  >,
): Type<FixedLengthArray<N, A>>;

// For sizes outside `SupportedLength` (`0..2048`) the length cannot be encoded in the brand,
// so the result length is left unconstrained (`readonly A[]`).
export function fixedLengthArray<A>(
  size: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function fixedLengthArray<A>(
  size: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> {
  type T = readonly A[];

  const typeName =
    options?.typeName ?? `FixedLengthArray<${size}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      Arr.create(asUint32(size), elementType.defaultValue),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'array',
          typeName,
          details: undefined,
        }),
      ]);
    }

    if (a.length !== size) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-length',
            expectedLength: size,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? Arr.map(
          Arr.seq(asUint32(size)),
          (i) => elementType.fill(a[i]) satisfies A,
        )
      : getDefaultValue();

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}

/**
 * Creates a `Type` for a readonly array with at least `minLength` elements,
 * typed as the branded {@link MinLengthArray} instead of the structural
 * `readonly [A, ..., A, ...A[]]` type produced by `minLengthTuple`.
 *
 * Because the length constraint lives only in the brand, the element type is
 * never expanded into tuple positions, which keeps type-checking cheap even
 * when `A` is a large type.
 */
export function minLengthArray<A, N extends SupportedLength>(
  minLength: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MinLengthArray<N, A>;
    }>
  >,
): Type<MinLengthArray<N, A>>;

// For bounds outside `SupportedLength` (`0..2048`) the length cannot be encoded in the brand,
// so the result length is left unconstrained (`readonly A[]`).
export function minLengthArray<A>(
  minLength: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function minLengthArray<A>(
  minLength: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> {
  type T = readonly A[];

  const typeName =
    options?.typeName ??
    `MinLengthArray<${minLength}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // An array of `minLength` elements is the shortest value satisfying the bound.
      Arr.create(asUint32(minLength), elementType.defaultValue),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'array',
          typeName,
          details: undefined,
        }),
      ]);
    }

    if (a.length < minLength) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-min-length',
            minLength,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) => {
    if (!Arr.isArray(a)) {
      return getDefaultValue();
    }

    // Keep the input if it is long enough; otherwise pad up to `minLength`.
    return a.length >= minLength
      ? Arr.map(a, (el) => elementType.fill(el) satisfies A)
      : Arr.map(
          Arr.seq(asUint32(minLength)),
          (i) => elementType.fill(a[i]) satisfies A,
        );
  };

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}

/**
 * Creates a `Type` for a readonly array with at most `maxLength` elements,
 * typed as the branded {@link MaxLengthArray} instead of the union of tuple
 * types produced by `maxLengthTuple`.
 *
 * Because the length constraint lives only in the brand, no union of tuples
 * of the element type is ever constructed, which keeps type-checking cheap
 * even when `A` is a large type.
 */
export function maxLengthArray<A, N extends SupportedLength>(
  maxLength: N,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MaxLengthArray<N, A>;
    }>
  >,
): Type<MaxLengthArray<N, A>>;

// For bounds outside `SupportedLength` (`0..2048`) the length cannot be encoded in the brand,
// so the result length is left unconstrained (`readonly A[]`).
export function maxLengthArray<A>(
  maxLength: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function maxLengthArray<A>(
  maxLength: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> {
  type T = readonly A[];

  const typeName =
    options?.typeName ??
    `MaxLengthArray<${maxLength}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // The empty array is the shortest value satisfying `length <= maxLength`.
      Arr.create(0, elementType.defaultValue),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'array',
          typeName,
          details: undefined,
        }),
      ]);
    }

    if (a.length > maxLength) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-max-length',
            maxLength,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? // Keep the input but trim down to at most `maxLength` elements.
        Arr.map(
          Arr.take(a, asUint32(maxLength)),
          (el) => elementType.fill(el) satisfies A,
        )
      : getDefaultValue();

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}

/**
 * Creates a `Type` for a readonly array whose length is within the inclusive
 * range `[min, max]`, typed as the branded {@link BoundedLengthArray} instead
 * of the union of tuple types produced by `boundedLengthTuple`.
 *
 * Because the length constraint lives only in the brand, no union of tuples
 * of the element type is ever constructed, which keeps type-checking cheap
 * even when `A` is a large type.
 */
export function boundedLengthArray<
  A,
  Min extends SupportedLength,
  Max extends SupportedLength,
>(
  min: Min,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: BoundedLengthArray<Min, Max, A>;
    }>
  >,
): Type<BoundedLengthArray<Min, Max, A>>;

// Only the lower bound is in `SupportedLength`, so the upper bound is dropped from
// the result type and only the "at least `min`" guarantee is kept.
export function boundedLengthArray<A, Min extends SupportedLength>(
  min: Min,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MinLengthArray<Min, A>;
    }>
  >,
): Type<MinLengthArray<Min, A>>;

// Only the upper bound is in `SupportedLength`, so the lower bound is dropped from
// the result type and only the "at most `max`" guarantee is kept.
export function boundedLengthArray<A, Max extends SupportedLength>(
  min: number,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MaxLengthArray<Max, A>;
    }>
  >,
): Type<MaxLengthArray<Max, A>>;

// Neither bound is in `SupportedLength`, so the result length is left unconstrained.
export function boundedLengthArray<A>(
  min: number,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]>;

export function boundedLengthArray<A>(
  min: number,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: readonly A[];
    }>
  >,
): Type<readonly A[]> {
  type T = readonly A[];

  const typeName =
    options?.typeName ??
    `BoundedLengthArray<${min}, ${max}, ${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): T =>
      options?.defaultValue ??
      // An array of the minimum length is the shortest value within the range.
      Arr.create(asUint32(min), elementType.defaultValue),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        createPrimitiveValidationError({
          actualValue: a,
          expectedType: 'array',
          typeName,
          details: undefined,
        }),
      ]);
    }

    if (a.length < min || max < a.length) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'array-range-length',
            minLength: min,
            maxLength: max,
            actualLength: a.length,
          },
        } satisfies ValidationError,
      ]);
    }

    return validateElements(a, elementType);
  };

  const fill: Type<T>['fill'] = (a) => {
    if (!Arr.isArray(a)) {
      return getDefaultValue();
    }

    // Trim down to at most `max`, then pad up to at least `min`.
    const capped = Arr.take(a, asUint32(max));

    return capped.length >= min
      ? Arr.map(capped, (el) => elementType.fill(el) satisfies A)
      : Arr.map(
          Arr.seq(asUint32(min)),
          (i) => elementType.fill(capped[i]) satisfies A,
        );
  };

  return buildType({ typeName, getDefaultValue, validate, fill, elementType });
}

const validateElements = <A,>(
  a: readonly unknown[],
  elementType: Type<A>,
): Result<readonly A[], readonly ValidationError[]> => {
  const errors: readonly ValidationError[] = Arr.generate(function* () {
    for (const [index, el] of a.entries()) {
      const res = elementType.validate(el);

      if (Result.isErr(res)) {
        yield* prependIndexToValidationErrors(res.value, index);
      }
    }
  });

  if (Arr.isNonEmpty(errors)) {
    return Result.err(errors);
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Result.ok(a as readonly A[]);
};

const buildType = <A,>({
  typeName,
  getDefaultValue,
  validate,
  fill,
  elementType,
}: Readonly<{
  typeName: string;
  getDefaultValue: () => readonly A[];
  validate: (a: unknown) => Result<readonly A[], readonly ValidationError[]>;
  fill: (a: unknown) => readonly A[];
  elementType: Type<A>;
}>): Type<readonly A[]> =>
  ({
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    prune: (a) => a.map((el) => elementType.prune(el)),
    validate,
    is: createIsFn(validate),
    cast: createCastFn(validate),
    assertIs: createAssertFn(validate),
  }) as const;
