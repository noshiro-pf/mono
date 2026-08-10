import { Arr, asUint32, memoizeFunction, Result } from 'ts-data-forge';
import {
  type BoundedLengthTuple,
  type MaxLengthTuple,
  type MinLengthTuple,
  type StructuralPrefixLength,
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

export type { BoundedLengthTuple } from 'ts-type-forge';

export function boundedLengthTuple<
  Min extends StructuralPrefixLength,
  Max extends StructuralPrefixLength,
  A,
>(
  min: Min,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: BoundedLengthTuple<Min, Max, A>;
    }>
  >,
): Type<BoundedLengthTuple<Min, Max, A>>;

// Only the lower bound is in `StructuralPrefixLength` (`0..10`), so the upper bound is dropped from the
// result type and only the "at least `min`" guarantee is kept.
export function boundedLengthTuple<Min extends StructuralPrefixLength, A>(
  min: Min,
  max: number,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MinLengthTuple<Min, A>;
    }>
  >,
): Type<MinLengthTuple<Min, A>>;

// Only the upper bound is in `StructuralPrefixLength` (`0..10`), so the lower bound is dropped from the
// result type and only the "at most `max`" guarantee is kept.
export function boundedLengthTuple<Max extends StructuralPrefixLength, A>(
  min: number,
  max: Max,
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: MaxLengthTuple<Max, A>;
    }>
  >,
): Type<MaxLengthTuple<Max, A>>;

// Neither bound is in `StructuralPrefixLength` (`0..10`), so the result length is left unconstrained.
export function boundedLengthTuple<A>(
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

export function boundedLengthTuple<A>(
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
    `BoundedLengthTuple<${min}, ${max}, ${elementType.typeName}>`;

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
    return Result.ok(a as unknown as T);
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

  const prune = (a: T): T => a.map((el) => elementType.prune(el));

  return {
    typeName,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    prune,
    validate,
    is: createIsFn(validate),
    cast: createCastFn(validate),
    assertIs: createAssertFn(validate),
  };
}
