import { createDateOptionId, type DateOptionId } from './types';

export type DateOption = Readonly<{
  id: DateOptionId;
  label: string;
}>;

export type PartialDateOption = Partial<DateOption>;

const dateOptionDefaultValue: DateOption = {
  id: createDateOptionId(''),
  label: '',
} as const;

const d = dateOptionDefaultValue;

export const fillDateOption = (from: PartialDateOption): DateOption => ({
  id: from.id ?? d.id,
  label: from.label ?? d.label,
});
