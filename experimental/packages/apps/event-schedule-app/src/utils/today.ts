export const now = (): Ymdhm => {
  const nowDateObj = DateUtils.today();
  return {
    year: DateUtils.getLocaleYear(nowDateObj),
    month: DateUtils.getLocaleMonth(nowDateObj),
    date: DateUtils.getLocaleDate(nowDateObj),
    hours: DateUtils.getLocaleHours(nowDateObj),
    minutes: DateUtils.getLocaleMinutes(nowDateObj),
  };
};
