const createDate = (modifier: (d: DateType) => DateType): RawDateType =>
  pipe(DateUtils.today())
    .chain(modifier)
    .chain(DateUtils.setLocaleHours(23))
    .chain(DateUtils.setLocaleMinutes(59))
    .chain(DateUtils.toDate).value;

export const answerDeadlineShortcuts: readonly DatePickerShortcut[] = [
  {
    date: createDate(idfn),
    label: 'Today',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleDate(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 1) as DateEnum,
      ),
    ),
    label: 'Tomorrow',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleDate(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 7) as DateEnum,
      ),
    ),
    label: '1 week later',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleDate(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 14) as DateEnum,
      ),
    ),
    label: '2 week later',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleMonth(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 1) as MonthEnum,
      ),
    ),
    label: '1 month later',
    includeTime: true,
  },
];
