import * as t from '@noshiro/io-ts';
import { dateOptionIdType } from './branded-types.mjs';

export const dateOptionType = t.record({
  id: dateOptionIdType,
  label: t.string(''),
});

export type DateOption = t.TypeOf<typeof dateOptionType>;

export const fillDateOption = dateOptionType.fill;
