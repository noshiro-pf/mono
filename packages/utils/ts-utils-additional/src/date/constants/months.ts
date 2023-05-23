export const months = {
  en: {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  } satisfies MonthsType,
  jp: {
    1: '一月',
    2: '二月',
    3: '三月',
    4: '四月',
    5: '五月',
    6: '六月',
    7: '七月',
    8: '八月',
    9: '九月',
    10: '十月',
    11: '十一月',
    12: '十二月',
  } satisfies MonthsType,
} as const;

export const monthsList = {
  en: [
    { value: 1, name: months.en[1] },
    { value: 2, name: months.en[2] },
    { value: 3, name: months.en[3] },
    { value: 4, name: months.en[4] },
    { value: 5, name: months.en[5] },
    { value: 6, name: months.en[6] },
    { value: 7, name: months.en[7] },
    { value: 8, name: months.en[8] },
    { value: 9, name: months.en[9] },
    { value: 10, name: months.en[10] },
    { value: 11, name: months.en[11] },
    { value: 12, name: months.en[12] },
  ] satisfies MonthsListType,
  jp: [
    { value: 1, name: months.jp[1] },
    { value: 2, name: months.jp[2] },
    { value: 3, name: months.jp[3] },
    { value: 4, name: months.jp[4] },
    { value: 5, name: months.jp[5] },
    { value: 6, name: months.jp[6] },
    { value: 7, name: months.jp[7] },
    { value: 8, name: months.jp[8] },
    { value: 9, name: months.jp[9] },
    { value: 10, name: months.jp[10] },
    { value: 11, name: months.jp[11] },
    { value: 12, name: months.jp[12] },
  ] satisfies MonthsListType,
} as const;

type MonthsType = Readonly<
  Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, string>
>;

type MonthsListType = readonly [
  Readonly<{ value: 1; name: string }>,
  Readonly<{ value: 2; name: string }>,
  Readonly<{ value: 3; name: string }>,
  Readonly<{ value: 4; name: string }>,
  Readonly<{ value: 5; name: string }>,
  Readonly<{ value: 6; name: string }>,
  Readonly<{ value: 7; name: string }>,
  Readonly<{ value: 8; name: string }>,
  Readonly<{ value: 9; name: string }>,
  Readonly<{ value: 10; name: string }>,
  Readonly<{ value: 11; name: string }>,
  Readonly<{ value: 12; name: string }>
];
