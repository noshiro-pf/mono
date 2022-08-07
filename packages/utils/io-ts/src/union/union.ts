import { Result } from '@noshiro/ts-utils';
import type { Type, TypeOf } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

type MapUnion<T extends Type<unknown>> = T extends T ? TypeOf<T> : never;

export const union = <A extends readonly Type<unknown>[]>({
  typeName = 'union',
  types,
  defaultType,
}: Readonly<{ typeName?: string; types: A; defaultType: A[number] }>): Type<
  MapUnion<A[number]>
> => {
  type T = MapUnion<A[number]>;

  const validate: Type<T>['validate'] = (a) => {
    if (!types.some((t) => t.is(a))) {
      const valuesStr = types.map((t) => t.typeName).join(', ');

      return Result.err([
        validationErrorMessage(
          a,
          `The type of value is expected to be one of the elements contained in { ${valuesStr} }`
        ),
      ]);
    }

    return Result.ok(undefined);
  };

  const is = createIsFnFromValidateFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : (defaultType.fill(a) as T));

  return {
    typeName,
    defaultValue: defaultType.defaultValue as T,
    fill,
    validate,
    is,
    assertIs: createAssertFunction(validate),
  };
};
