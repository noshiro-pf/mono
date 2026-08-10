import { isNumber, memoizeFunction, Num, Result } from 'ts-data-forge';
import { type Uint11, type UintRangeInclusive } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

export type { UintRangeInclusive } from 'ts-type-forge';

export const uintRangeInclusive = <Start extends Uint11, End extends Uint11>(
  ...args:
    | readonly [
        start: Start,
        end: End,
        options?: Readonly<{
          typeName?: string;
          defaultValue?: UintRangeInclusive<Start, End>;
        }>,
      ]
    | readonly [
        options: Readonly<{
          start: Start;
          end: End;
          typeName?: string;
          defaultValue?: UintRangeInclusive<Start, End>;
        }>,
      ]
): Type<UintRangeInclusive<Start, End>> => {
  switch (args.length) {
    case 1:
      return uintRangeInclusiveImpl(args[0].start, args[0].end, {
        defaultValue: args[0].defaultValue,
        typeName: args[0].typeName,
      });

    case 2:
      return uintRangeInclusiveImpl(args[0], args[1]);

    case 3:
      return uintRangeInclusiveImpl(args[0], args[1], args[2]);
  }
};

const uintRangeInclusiveImpl = <Start extends Uint11, End extends Uint11>(
  start: Start,
  end: End,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: UintRangeInclusive<Start, End>;
  }>,
): Type<UintRangeInclusive<Start, End>> => {
  type T = UintRangeInclusive<Start, End>;

  const typeNameFilled =
    options?.typeName ?? `uintRangeInclusive(${start}, ${end})`;

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
