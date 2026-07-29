import {
  expectType,
  isNumber,
  memoizeFunction,
  Num,
  Result,
} from 'ts-data-forge';
import {
  type BoolAnd,
  type Index,
  type IndexInclusive,
  type Int8,
  type NegativeIndex,
  type TypeExtends,
  type UintRange,
} from 'ts-type-forge';
import { type Type } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
} from '../utils/index.mjs';

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

type NegativeRange = NegativeIndex<128>;

type PositiveRange = IndexInclusive<128>;

export type IntRange<Start extends Int8, End extends Int8 | 128> =
  BoolAnd<
    TypeExtends<Start, PositiveRange>,
    TypeExtends<End, PositiveRange>
  > extends true
    ? UintRange<Start, End>
    : BoolAnd<
          TypeExtends<Start, NegativeRange>,
          TypeExtends<End, PositiveRange>
        > extends true
      ? NegativeIndex<NegativeToPositive<Start>> | Index<End>
      : BoolAnd<
            TypeExtends<Start, PositiveRange>,
            TypeExtends<End, NegativeRange>
          > extends true
        ? never
        : BoolAnd<
              TypeExtends<Start, NegativeRange>,
              TypeExtends<End, NegativeRange>
            > extends true
          ? Exclude<
              NegativeIndex<NegativeToPositive<Start>>,
              NegativeIndex<NegativeToPositive<End>>
            >
          : never;

type NegativeToPositive<N extends number> =
  `${N}` extends `-${infer D extends number}` ? D : never;

expectType<NegativeToPositive<-3>, 3>('=');

expectType<IntRange<1, 5>, 1 | 2 | 3 | 4>('=');

expectType<IntRange<-3, 3>, -3 | -2 | -1 | 0 | 1 | 2>('=');

expectType<IntRange<3, -3>, never>('=');

expectType<IntRange<-5, -1>, -5 | -4 | -3 | -2>('=');
