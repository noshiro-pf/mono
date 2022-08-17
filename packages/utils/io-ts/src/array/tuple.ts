import { IList, Result } from '@noshiro/ts-utils';
import type { Type, TypeOf } from '../type';
import {
  createAssertFunction,
  createIsFnFromValidateFn,
  validationErrorMessage,
} from '../utils';

type MapTuple<T extends readonly Type<unknown>[]> = {
  readonly [K in keyof T]: TypeOf<T[K]>;
};

export const tuple = <A extends readonly Type<unknown>[]>({
  types,
  typeName = 'tuple',
}: Readonly<{ types: A; typeName?: string }>): Type<MapTuple<A>> => {
  type T = MapTuple<A>;

  const defaultValue = types.map((t) => t.defaultValue) as MapTuple<A>;

  const validate: Type<T>['validate'] = (a) => {
    if (!IList.isArray(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be an array'),
      ]);
    }

    if (a.length !== types.length) {
      return Result.err([
        `The length of tuple is expected to be ${types.length}, but it is actually ${a.length}.`,
      ]);
    }

    for (const [index, [typeDef, el]] of IList.zip(types, a).entries()) {
      const res = typeDef.validate(el);

      if (Result.isErr(res)) {
        const message = validationErrorMessage(
          el,
          `The tuple element at ${index} is expected to be <${typeDef.typeName}>`
        );

        return Result.err([message, ...res.value]);
      }
    }

    return Result.ok(undefined);
  };

  const fill: Type<T>['fill'] = (a) =>
    !IList.isArray(a)
      ? defaultValue
      : (types.map((t, i) => t.fill(a[i])) as MapTuple<A>);

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFnFromValidateFn(validate),
    assertIs: createAssertFunction(validate),
  };
};
