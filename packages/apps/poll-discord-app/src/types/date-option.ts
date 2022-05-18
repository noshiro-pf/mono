import type { DateOptionId } from './types';
import { createDateOptionId } from './types';

export type DateOption = Readonly<{
  id: DateOptionId;
  label: string;
}>;

export const isDateOption = (a: unknown): a is DateOption =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'id', isString) &&
  IRecord.hasKeyValue(a, 'label', isString);

const dateOptionDefaultValue: DateOption = {
  id: createDateOptionId(''),
  label: '',
} as const;

const d = dateOptionDefaultValue;

export const fillDateOption = (a: unknown): DateOption =>
  !isRecord(a)
    ? d
    : {
        id: IRecord.hasKeyValue(a, 'id', isString) ? a.id : d.id,
        label: IRecord.hasKeyValue(a, 'label', isString) ? a.label : d.label,
      };
