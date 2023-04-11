export type YmdKey = Brand<string, 'YmdKey'>;

export const ymdToKey = ({ year, month, date }: YearMonthDate): YmdKey =>
  `${year}-${month}-${date}` as YmdKey;

export const ymdFromKey = (ymdKey: YmdKey): YearMonthDate => {
  const [yearStr, monthStr, dateStr] = ymdKey.split(
    '-'
  ) as MutableArrayOfLength<3, string>;
  return {
    year: (Num.mapNaN2Undefined(Number.parseInt(yearStr, 10)) ??
      1970) as YearEnum,
    month: (Num.mapNaN2Undefined(Number.parseInt(monthStr, 10)) ??
      1) as MonthEnum,
    date: (Num.mapNaN2Undefined(Number.parseInt(dateStr, 10)) ?? 1) as DateEnum,
  };
};
