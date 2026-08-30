import { asSafeUint, Num, Result } from 'ts-data-forge';
import {
  type Brand,
  type DateEnum,
  type MonthEnum,
  type MutableFixedLengthTuple,
} from 'ts-type-forge';

export type YmdKey = Brand<string, 'YmdKey'>;

export const ymdToKey = ({ year, month, date }: YearMonthDate): YmdKey =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  `${year}-${month}-${date}` as YmdKey;

export const ymdFromKey = (ymdKey: YmdKey): YearMonthDate => {
  const [yearStr, monthStr, dateStr] =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    ymdKey.split('-') as MutableFixedLengthTuple<3, string>;

  return {
    year: asSafeUint(
      Num.mapNaN2Undefined(
        Result.unwrapOkOr(Num.safeParseInt(yearStr), Number.NaN),
      ) ?? 1970,
    ),
    month:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Num.mapNaN2Undefined(
        Result.unwrapOkOr(Num.safeParseInt(monthStr), Number.NaN),
      ) ?? 1) as MonthEnum,
    date:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Num.mapNaN2Undefined(
        Result.unwrapOkOr(Num.safeParseInt(dateStr), Number.NaN),
      ) ?? 1) as DateEnum,
  };
};
