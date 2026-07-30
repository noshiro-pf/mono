import { isNumber, memoizeFunction, Num, Result } from 'ts-data-forge';
import { type Int8, type IntRange } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

export type { IntRange } from 'ts-type-forge';

export const intRange = <Start extends Int8, End extends Int8 | 128>({
  end,
  start,
  ...options
}: Readonly<{
  start: Start;
  end: End;
  typeName?: string;
  defaultValue?: IntRange<Start, End>;
}>): Type<IntRange<Start, End>> => {
  type T = IntRange<Start, End>;

  const typeNameFilled = options.typeName ?? `intRange(${start}, ${end})`;

  const getDefaultValue = memoizeFunction(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (): T => options.defaultValue ?? (start as T),
  );

  const validate: Type<T>['validate'] = (a) => {
    if (!(
      isNumber(a) &&
      Number.isSafeInteger(a) &&
      Num.isInRange(start, end)(a)
    )) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeNameFilled,
          typeName: typeNameFilled,
          details: {
            kind: 'integer-range',
            start,
            endExclusive: end,
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
