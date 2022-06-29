import * as t from '@noshiro/io-ts';
import { dateOptionIdTypeDef } from './types';

export const dateOptionTypeDef = t.record({
  id: dateOptionIdTypeDef,
  label: t.string(''),
});

export type DateOption = t.TypeOf<typeof dateOptionTypeDef>;

export const isDateOption = dateOptionTypeDef.is;

export const dateOptionDefaultValue: DateOption =
  dateOptionTypeDef.defaultValue;

export const fillDateOption = dateOptionTypeDef.fill;
