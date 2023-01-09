import { Arr, Result } from '@noshiro/ts-utils';
import type { Type } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

type Index1000 = Index<1000>;

export const arrayOfLength = <A, N extends Index1000>(
  size: N,
  elementType: Type<A>,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: ArrayOfLength<N, A>;
  }>
): Type<ArrayOfLength<N, A>> => {
  type T = ArrayOfLength<N, A>;

  const {
    typeName,
    defaultValue = Arr.zerosUnwrapped(size as number).map(
      () => elementType.defaultValue
    ) as unknown as ArrayOfLength<N, A>,
  } = options ?? {};

  const zs = Arr.zerosUnwrapped(size as number);

  const typeNameFilled: string =
    typeName ?? `[${zs.map(() => elementType.typeName).join(', ')}]`;

  const validate: Type<T>['validate'] = (a) => {
    if (!Arr.isArray(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be an array'),
      ]);
    }

    if (a.length !== size) {
      return Result.err([
        `The value is expected to be an array of length ${size}, but it is ${a.length}.`,
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

    return Result.ok(a as unknown as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    Arr.isArray(a)
      ? (zs.map((_, i) => elementType.fill(a[i])) as unknown as T)
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
