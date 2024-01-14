import * as t from '@noshiro/io-ts';

export const yearsTypeDef = t.safeUint(
  1900,
  // pipe(DateUtils.today()).chain(DateUtils.getLocaleYear).value
);

export const toYears = yearsTypeDef.fill;

export const monthsTypeDef = t.uintRange({
  start: 1,
  end: 13,
  defaultValue: 1,
});
// pipe(DateUtils.today()).chain(DateUtils.getLocaleMonth).value

export const datesTypeDef = t.uintRange({ start: 1, end: 32, defaultValue: 1 });
// pipe(DateUtils.today()).chain(DateUtils.getLocaleDate).value

export const hoursTypeDef = t.uintRange({ start: 0, end: 24, defaultValue: 0 });

export const minutesTypeDef = t.uintRange({
  start: 0,
  end: 60,
  defaultValue: 0,
});
