import * as t from '@noshiro/io-ts';

export const yearsTypeDef = t.positiveInteger(
  1900
  // pipe(IDate.today()).chain(IDate.getLocaleYear).value
);

export const monthsTypeDef = t.uintRange(
  1,
  12,
  1
  // pipe(IDate.today()).chain(IDate.getLocaleMonth).value
);

export const datesTypeDef = t.uintRange(
  1,
  31,
  1
  // pipe(IDate.today()).chain(IDate.getLocaleDate).value
);

export const hoursTypeDef = t.uintRange(0, 23, 0);

export const minutesTypeDef = t.uintRange(0, 59, 0);
