import { Arr, Result } from '@noshiro/ts-utils';
import type { Type } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

export const nonEmptyArray = <A>(
  elementType: Type<A>,
  defaultValue: NonEmptyArray<A>,
  options?: Readonly<{
    typeName?: string;
  }>
): Type<NonEmptyArray<A>> => {
  type T = NonEmptyArray<A>;

  const { typeName } = options ?? {};

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
          (str) => `but the actual value at index ${index} is '${str}'`
        );

        return Result.err([message, ...res.value]);
      }
    }

    return Result.ok(a as T);
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
    is: createIsFnFromValidateFn(validate),
    assertIs: createAssertFunction(validate),
  };
};
