import * as t from '@noshiro/io-ts';

export const dateOptionType = t.record({
  id: t.string(''),
  label: t.string(''),
});

export type DateOption = t.TypeOf<typeof dateOptionType>;

export const fillDateOption = dateOptionType.fill;
