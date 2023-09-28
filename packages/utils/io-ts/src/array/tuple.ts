import { Arr, Result, TupleUtils } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils';

type MapTuple<T extends readonly Type<unknown>[]> = {
  readonly [K in keyof T]: TypeOf<T[K]>;
};

export const tuple = <A extends readonly Type<unknown>[]>(
  types: A,
  options?: Partial<Readonly<{ typeName?: string }>>
): Type<MapTuple<A>> => {
  type T = MapTuple<A>;

  const { typeName = 'tuple' } = options ?? {};
  const defaultValue = TupleUtils.map(
    types,
    (t) => t.defaultValue
  ) satisfies MapTuple<A>;

  const validate: Type<T>['validate'] = (a) => {
    if (!Array.isArray(a)) {
      return Result.err([
        validationErrorMessage(a, 'The value is expected to be an array'),
      ]);
    }

    if (a.length !== types.length) {
      return Result.err([
        `The length of tuple is expected to be ${types.length}, but it is actually ${a.length}.`,
      ]);
    }

    for (const [index, [typeDef, el]] of Arr.zip(types, a).entries()) {
      const res = typeDef.validate(el);

      if (Result.isErr(res)) {
        const message = validationErrorMessage(
          el,
          `The tuple element at ${index} is expected to be <${typeDef.typeName}>`
        );

        return Result.err([message, ...res.value]);
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    return Result.ok(a as T);
  };

  const fill: Type<T>['fill'] = (a) =>
    !Array.isArray(a)
      ? defaultValue
      : // eslint-disable-next-line no-restricted-syntax
        (types.map((t, i) => t.fill(a[i])) as MapTuple<A>);

  return {
    typeName,
    defaultValue,
    fill,
    validate,
    is: createIsFn(validate),
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
