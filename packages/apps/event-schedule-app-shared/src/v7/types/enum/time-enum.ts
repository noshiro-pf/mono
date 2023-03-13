import * as t from '@noshiro/io-ts';

export const yearsTypeDef = t.positiveInteger(
  1900
  // pipe(DateUtils.today()).chain(DateUtils.getLocaleYear).value
);

export const toYears = yearsTypeDef.fill;

export const monthsTypeDef = t.uintRange({ min: 1, max: 12, defaultValue: 1 });
// pipe(DateUtils.today()).chain(DateUtils.getLocaleMonth).value

export const datesTypeDef = t.uintRange({ min: 1, max: 31, defaultValue: 1 });
// pipe(DateUtils.today()).chain(DateUtils.getLocaleDate).value

export const hoursTypeDef = t.uintRange({ min: 0, max: 23, defaultValue: 0 });

export const minutesTypeDef = t.uintRange({ min: 0, max: 59, defaultValue: 0 });
