import { Result } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

type MapUnion<T extends Type<unknown>> = T extends T ? TypeOf<T> : never;

export const union = <const A extends NonEmptyArray<Type<unknown>>>(
  types: A,
  options?: Readonly<{
    typeName?: string;
    defaultType?: ArrayElement<A>;
  }>,
): Type<MapUnion<ArrayElement<A>>> => {
  type T = MapUnion<ArrayElement<A>>;

  const defaultType = options?.defaultType ?? types[0];

  const validate: Type<T>['validate'] = (a) =>
    types.some((t) => t.is(a))
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(a as T)
      : Result.err([
          validationErrorMessage(
            a,
            `The type of value is expected to be one of the elements contained in { ${types
              .map((t) => t.typeName)
              .join(', ')} }`,
          ),
        ]);

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) =>
    is(a)
      ? a
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (defaultType.fill(a) as T);

  return {
    typeName: options?.typeName ?? 'union',

    defaultValue:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      defaultType.defaultValue as T,

    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
