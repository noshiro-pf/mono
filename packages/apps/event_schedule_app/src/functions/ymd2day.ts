export const ymd2day = (ymd: YearMonthDate): DayOfWeekIndex =>
  IDate.getLocaleDayOfWeek(IDate.create(ymd.year, ymd.month, ymd.date));
