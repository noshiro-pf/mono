import { type MonthEnum, type MonthIndexEnum } from 'ts-type-forge';

// embed-sample-code-ignore-above

const createDate = (year: number, month: MonthIndexEnum, day: number) =>
  new Date(year, month, day);

const januaryDate = createDate(2024, 0, 1); // January 1, 2024
const decemberDate = createDate(2024, 11, 31); // December 31, 2024

// Convert from 1-based to 0-based
const toMonthIndex = (month: MonthEnum): MonthIndexEnum =>
  (month - 1) as MonthIndexEnum;

// embed-sample-code-ignore-below
export { createDate, decemberDate, januaryDate, toMonthIndex };
