import { Arr, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

export const nonEmptyArray = <A,>(
  elementType: Type<A>,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: NonEmptyArray<A>;
  }>,
): Type<NonEmptyArray<A>> => {
  type T = NonEmptyArray<A>;

  const { typeName, defaultValue = Arr.newArray(1, elementType.defaultValue) } =
    options ?? {};

  const typeNameFilled: string =
    typeName ?? `NonEmptyArray<${elementType.typeName}>`;

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be an array'),
      ]);
    }

    if (Arr.isEmpty(a)) {
      return Result.err([
        'The value is expected to be a non-empty array, but it is empty.',
      ]);
    }

    for (const [index, el] of a.entries()) {
      const res = elementType.validate(el);

      if (Result.isErr(res)) {
        const message = validationErrorMessage(
          el,
          `The array element is expected to be <${elementType.typeName}>`,
          (str) => `but the actual value at index ${index} is '${str}'`,
        );

        return Result.err([message, ...res.value]);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Result.ok(a as unknown as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a) && Arr.isNonEmpty(a)
      ? Arr.map(a, (e) => elementType.fill(e))
      : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
