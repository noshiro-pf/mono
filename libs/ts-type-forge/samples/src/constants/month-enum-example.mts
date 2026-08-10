import { type MonthEnum } from 'ts-type-forge';

// embed-sample-code-ignore-above

const getMonthName = (month: MonthEnum): string => {
  const names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const;
  return names[month - 1] ?? ''; // Convert to 0-based for array access
};

const january = 1 satisfies MonthEnum;
const december = 12 satisfies MonthEnum;
// const invalid = 13 satisfies MonthEnum; // Error: not assignable to MonthEnum

// embed-sample-code-ignore-below
export { december, getMonthName, january };
