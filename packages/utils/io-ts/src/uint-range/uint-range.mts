import { isNumber, Json, Num, Result } from '@noshiro/ts-utils';
import { type Type } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';

export const uintRange = <
  Start extends Uint8,
  End extends Exclude<Uint8, Start>,
>({
  defaultValue,
  end,
  start,
  typeName,
}: Readonly<{
  typeName?: string;
  start: Start;
  end: End;
  defaultValue: UintRange<Start, End>;
}>): Type<UintRange<Start, End>> => {
  type T = UintRange<Start, End>;

  const typeNameFilled = typeName ?? `uintRange(${start}, ${end})`;

  const validate: Type<T>['validate'] = (a) => {
    if (!(isNumber(a) && Number.isInteger(a) && Num.isInRange(start, end)(a))) {
      const stringifyResult = Json.stringify(a);

      const prefix = `The value is expected to be an integer between ${start} and ${
        end - 1
      }`;

      if (Result.isErr(stringifyResult)) {
        return Result.err([
          `${prefix}, but it isn't (stringification failed).`,
        ]);
      }

      const str = stringifyResult.value;

      return Result.err([`${prefix}, but it is actually '${str}'.`]);
    }

    // eslint-disable-next-line no-restricted-syntax
    return Result.ok(a as T);
  };

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultValue);

  return {
    typeName: typeNameFilled,
    defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
