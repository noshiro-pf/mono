export const ymd2day = (ymd: YearMonthDate): DayOfWeekIndex =>
  DateUtils.getLocaleDayOfWeek(DateUtils.create(ymd.year, ymd.month, ymd.date));
