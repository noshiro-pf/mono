export type YmdKey = Brand<string, 'YmdKey'>;

export const ymdToKey = ({ year, month, date }: YearMonthDate): YmdKey =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  `${year}-${month}-${date}` as YmdKey;

export const ymdFromKey = (ymdKey: YmdKey): YearMonthDate => {
  const [yearStr, monthStr, dateStr] =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    ymdKey.split('-') as MutableArrayOfLength<3, string>;

  return {
    year:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Num.mapNaN2Undefined(Number.parseInt(yearStr, 10)) ?? 1970) as YearEnum,
    month:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Num.mapNaN2Undefined(Number.parseInt(monthStr, 10)) ?? 1) as MonthEnum,
    date:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Num.mapNaN2Undefined(Number.parseInt(dateStr, 10)) ?? 1) as DateEnum,
  };
};
