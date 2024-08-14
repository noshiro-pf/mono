import { Arr, Result, Tpl } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

export const arrayOfLength = <A, N extends SmallUint>(
  size: N,
  elementType: Type<A>,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: ArrayOfLength<N, A>;
  }>,
): Type<ArrayOfLength<N, A>> => {
  type T = ArrayOfLength<N, A>;

  const {
    typeName,
    defaultValue = Arr.newArray(size, elementType.defaultValue),
  } = options ?? {};

  const typeNameFilled: string =
    typeName ?? `[${Arr.newArray(size, elementType.typeName).join(', ')}]`;

  const validate: Type<T>['validate'] = (a) => {
    if (!Array.isArray(a)) {
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
          (str) => `but the actual value at index ${index} is '${str}'`,
        );

        return Result.err([message, ...res.value]);
      }
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as unknown as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    Array.isArray(a)
      ? // TODO: remove as
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (Tpl.map(Arr.seq(size), (i) => elementType.fill(a[i]) satisfies A) as T)
      : defaultValue;

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    cast: createCastFn(validate),
    assertIs: createAssertFn(validate),
  };
};
