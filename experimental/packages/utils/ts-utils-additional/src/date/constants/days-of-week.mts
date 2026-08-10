export const daysOfWeek = {
  en: {
    Sun: { name: 'Sunday', abbr: 'Su' },
    Mon: { name: 'Monday', abbr: 'Mo' },
    Tue: { name: 'Tuesday', abbr: 'Tu' },
    Wed: { name: 'Wednesday', abbr: 'We' },
    Thr: { name: 'Thursday', abbr: 'Th' },
    Fri: { name: 'Friday', abbr: 'Fr' },
    Sat: { name: 'Saturday', abbr: 'Sa' },
  } satisfies MonthsType,
  jp: {
    Sun: { name: '日曜日', abbr: '日' },
    Mon: { name: '月曜日', abbr: '月' },
    Tue: { name: '火曜日', abbr: '火' },
    Wed: { name: '水曜日', abbr: '水' },
    Thr: { name: '木曜日', abbr: '木' },
    Fri: { name: '金曜日', abbr: '金' },
    Sat: { name: '土曜日', abbr: '土' },
  } satisfies MonthsType,
} as const;

export const daysOfWeekList = {
  en: [
    { name: 'Sunday', abbr: 'Su' },
    { name: 'Monday', abbr: 'Mo' },
    { name: 'Tuesday', abbr: 'Tu' },
    { name: 'Wednesday', abbr: 'We' },
    { name: 'Thursday', abbr: 'Th' },
    { name: 'Friday', abbr: 'Fr' },
    { name: 'Saturday', abbr: 'Sa' },
  ] satisfies WeekdaysType,
  jp: [
    { name: '日曜日', abbr: '日' },
    { name: '月曜日', abbr: '月' },
    { name: '火曜日', abbr: '火' },
    { name: '水曜日', abbr: '水' },
    { name: '木曜日', abbr: '木' },
    { name: '金曜日', abbr: '金' },
    { name: '土曜日', abbr: '土' },
  ] satisfies WeekdaysType,
} as const;

type MonthsType = Readonly<
  Record<DayOfWeekName, Readonly<{ name: string; abbr: string }>>
>;

type WeekdaysType = readonly [
  Readonly<{ name: string; abbr: string }>,
  Readonly<{ name: string; abbr: string }>,
  Readonly<{ name: string; abbr: string }>,
  Readonly<{ name: string; abbr: string }>,
  Readonly<{ name: string; abbr: string }>,
  Readonly<{ name: string; abbr: string }>,
  Readonly<{ name: string; abbr: string }>,
];
