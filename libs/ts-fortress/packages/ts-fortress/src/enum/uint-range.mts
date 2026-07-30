import { isNumber, memoizeFunction, Num, Result } from 'ts-data-forge';
import { type Uint11, type UintRange } from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

export type { UintRange } from 'ts-type-forge';

export const uintRange = <
  Start extends Uint11,
  End extends Exclude<Uint11 | 2048, Start>,
>(
  ...args:
    | readonly [
        start: Start,
        end: End,
        options?: Readonly<{
          typeName?: string;
          defaultValue?: UintRange<Start, End>;
        }>,
      ]
    | readonly [
        options: Readonly<{
          start: Start;
          end: End;
          typeName?: string;
          defaultValue?: UintRange<Start, End>;
        }>,
      ]
): Type<UintRange<Start, End>> => {
  switch (args.length) {
    case 1:
      return uintRangeImpl(args[0].start, args[0].end, {
        defaultValue: args[0].defaultValue,
        typeName: args[0].typeName,
      });

    case 2:
      return uintRangeImpl(args[0], args[1]);

    case 3:
      return uintRangeImpl(args[0], args[1], args[2]);
  }
};

const uintRangeImpl = <
  Start extends Uint11,
  End extends Exclude<Uint11 | 2048, Start>,
>(
  start: Start,
  end: End,
  options?: Readonly<{
    typeName?: string;
    defaultValue?: UintRange<Start, End>;
  }>,
): Type<UintRange<Start, End>> => {
  type T = UintRange<Start, End>;

  const typeNameFilled = options?.typeName ?? `uintRange(${start}, ${end})`;

  const getDefaultValue = memoizeFunction(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (): T => options?.defaultValue ?? (start as T),
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
