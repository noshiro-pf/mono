import { isNumber, Num, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';
import { type ValidationErrorWithMessage } from '../validation-error.mjs';

export const uintRange = <
  Start extends Uint8,
  End extends Exclude<Uint8, Start>,
>({
  start,
  end,
  ...options
}: Readonly<{
  typeName?: string;
  start: Start;
  end: End;
  defaultValue?: UintRange<Start, End>;
}>): Type<UintRange<Start, End>> => {
  type T = UintRange<Start, End>;

  const typeNameFilled = options.typeName ?? `uintRange(${start}, ${end})`;

  const defaultValue: T =
    options.defaultValue ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    (start as T);

  const validate: Type<T>['validate'] = (a) => {
    if (!(isNumber(a) && Number.isInteger(a) && Num.isInRange(start, end)(a))) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeNameFilled,
          message: `The value is expected to be an integer between ${start} and ${end - 1}`,
          typeName: typeNameFilled,
        } satisfies ValidationErrorWithMessage,
      ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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
