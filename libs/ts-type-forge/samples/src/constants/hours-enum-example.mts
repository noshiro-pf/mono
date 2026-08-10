import { type HoursEnum } from 'ts-type-forge';

// embed-sample-code-ignore-above

const formatHour = (hour: HoursEnum): string =>
  hour.toString().padStart(2, '0');

const is12HourFormat = (hour: HoursEnum): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const midnight = 0 satisfies HoursEnum;
const noon = 12 satisfies HoursEnum;
const elevenPM = 23 satisfies HoursEnum;

// embed-sample-code-ignore-below
export { elevenPM, formatHour, is12HourFormat, midnight, noon };
