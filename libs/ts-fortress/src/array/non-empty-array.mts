import { Arr, memoizeFunction, Result } from 'ts-data-forge';
import { type NonEmptyArray, type NonEmptyTuple } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createPrimitiveValidationError,
  prependIndexToValidationErrors,
  type ValidationError,
} from '../utils/index.mjs';
import { buildType } from './build-type.mjs';

export type { NonEmptyArray } from 'ts-type-forge';

export const nonEmptyArray = <A,>(
  elementType: Type<A>,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: NonEmptyTuple<A>;
    }>
  >,
): Type<NonEmptyArray<A>> => {
  const typeName =
    options?.typeName ?? `NonEmptyArray<${elementType.typeName}>`;

  const getDefaultValue = memoizeFunction(
    (): readonly A[] =>
      options?.defaultValue ?? Arr.newArray(1, elementType.defaultValue),
  );

  const validate = (
    a: unknown,
  ): Result<readonly A[], readonly ValidationError[]> => {
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

    if (Arr.isEmpty(a)) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeName,
          typeName,
          details: {
            kind: 'non-empty-array',
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
    return Result.ok(a as readonly A[]);
  };

  const fill = (a: unknown): readonly A[] =>
    Arr.isArray(a) && Arr.isMinLengthTuple(a, 1)
      ? Arr.map(a, (e) => elementType.fill(e) satisfies A)
      : getDefaultValue();

  return buildType<A, NonEmptyArray<A>>({
    typeName,
    getDefaultValue,
    validate,
    fill,
    elementType,
  });
};
