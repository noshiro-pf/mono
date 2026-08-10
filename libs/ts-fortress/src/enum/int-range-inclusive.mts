import { isNumber, memoizeFunction, Num, Result } from 'ts-data-forge';
import { type Int11, type IntRangeInclusive } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

export type { IntRangeInclusive } from 'ts-type-forge';

export const intRangeInclusive = <Start extends Int11, End extends Int11>(
  ...args:
    | readonly [
        start: Start,
        end: End,
        options?: Readonly<{
          typeName?: string;
          defaultValue?: IntRangeInclusive<Start, End>;
        }>,
      ]
    | readonly [
        options: Readonly<{
          start: Start;
          end: End;
          typeName?: string;
          defaultValue?: IntRangeInclusive<Start, End>;
        }>,
      ]
): Type<IntRangeInclusive<Start, End>> => {
  switch (args.length) {
    case 1:
      return intRangeInclusiveImpl(args[0].start, args[0].end, {
        defaultValue: args[0].defaultValue,
        typeName: args[0].typeName,
      });

    case 2:
      return intRangeInclusiveImpl(args[0], args[1]);

    case 3:
      return intRangeInclusiveImpl(args[0], args[1], args[2]);
  }
};

const intRangeInclusiveImpl = <Start extends Int11, End extends Int11>(
  start: Start,
  end: End,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: IntRangeInclusive<Start, End>;
  }>,
): Type<IntRangeInclusive<Start, End>> => {
  type T = IntRangeInclusive<Start, End>;

  const typeNameFilled =
    options?.typeName ?? `intRangeInclusive(${start}, ${end})`;

  const getDefaultValue = memoizeFunction(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (): T => options?.defaultValue ?? (start as T),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!(
      isNumber(a) &&
      Number.isSafeInteger(a) &&
      Num.isInRangeInclusive(start, end)(a)
    )) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeNameFilled,
          typeName: typeNameFilled,
          details: {
            kind: 'integer-range-inclusive',
            start,
            endInclusive: end,
          },
        } satisfies ValidationError,
      ]);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : getDefaultValue());

  return {
    typeName: typeNameFilled,
    get defaultValue() {
      return getDefaultValue();
    },
    fill,
    prune: (a) => a,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
