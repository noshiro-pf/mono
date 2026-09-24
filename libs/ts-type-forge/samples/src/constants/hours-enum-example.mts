import { type HoursEnum } from 'ts-type-forge';

// embed-sample-code-ignore-above

const formatHour = (hour: HoursEnum): string =>
  hour.toString().padStart(2, '0');

const is12HourFormat = (hour: HoursEnum): string =>
  hour === 0
    ? '12 AM'
    : hour === 12
      ? '12 PM'
      : hour < 12
        ? `${hour} AM`
        : `${hour - 12} PM`;

const midnight = 0 satisfies HoursEnum;
const noon = 12 satisfies HoursEnum;
const elevenPM = 23 satisfies HoursEnum;

// embed-sample-code-ignore-below
export { elevenPM, formatHour, is12HourFormat, midnight, noon };
