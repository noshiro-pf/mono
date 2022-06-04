export const now = (): Ymdhm => {
  const nowDateObj = IDate.today();
  return {
    year: IDate.getLocaleYear(nowDateObj),
    month: IDate.getLocaleMonth(nowDateObj),
    date: IDate.getLocaleDate(nowDateObj),
    hours: IDate.getLocaleHours(nowDateObj),
    minutes: IDate.getLocaleMinutes(nowDateObj),
  };
};
