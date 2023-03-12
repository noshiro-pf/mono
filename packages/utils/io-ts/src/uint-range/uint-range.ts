import { isNumber, Json, Num, Result } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createAssertFunction, createIsFnFromValidateFn } from '../utils';

export const uintRange = <Max extends Index<100>, Min extends Index<Max>>({
  defaultValue,
  max,
  min,
  typeName,
}: Readonly<{
  typeName?: string;
  min: Min;
  max: Max;
  defaultValue: UintRange<Min, Max>;
}>): Type<UintRange<Min, Max>> => {
  type T = UintRange<Min, Max>;

  const typeNameFilled = typeName ?? `uintRange(${min}, ${max})`;

  const validate: Type<T>['validate'] = (a) => {
    if (!(isNumber(a) && Num.isInt(a) && Num.isInRange(min, max)(a))) {
      const stringifyResult = Json.stringify(a);

      const prefix = `The value is expected to be an integer between ${min} and ${max}`;

      if (Result.isErr(stringifyResult)) {
        return Result.err([
          `${prefix}, but it isn't (stringification failed).`,
        ]);
      }

      const str = stringifyResult.value;

      return Result.err([`${prefix}, but it is actually '${str}'.`]);
    }

    return Result.ok(a as T);
  };

  const is = createIsFnFromValidateFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultValue);

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFunction(validate),
  };
};
