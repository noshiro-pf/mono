import { Result } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

type MapUnion<T extends Type<unknown>> = T extends T ? TypeOf<T> : never;

export const union = <A extends NonEmptyArray<Type<unknown>>>({
  typeName = 'union',
  types,
  defaultType,
}: Readonly<{
  typeName?: string;
  types: A;
  defaultType: ArrayElement<A>;
}>): Type<MapUnion<ArrayElement<A>>> => {
  type T = MapUnion<ArrayElement<A>>;

  const validate: Type<T>['validate'] = (a) =>
    types.some((t) => t.is(a))
      ? // eslint-disable-next-line no-restricted-syntax
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

  // eslint-disable-next-line no-restricted-syntax
  const fill: Type<T>['fill'] = (a) => (is(a) ? a : (defaultType.fill(a) as T));

  return {
    typeName,
    // eslint-disable-next-line no-restricted-syntax
    defaultValue: defaultType.defaultValue as T,
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};