import { createDateOptionId, type DateOptionId } from './types';

export type DateOption = Readonly<{
  id: DateOptionId;
  label: string;
}>;

export const isDateOption = (a: unknown): a is DateOption =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'id', isString) &&
  Obj.hasKeyValue(a, 'label', isString);

const dateOptionDefaultValue: DateOption = {
  id: createDateOptionId(''),
  label: '',
} as const;

const d = dateOptionDefaultValue;

export const fillDateOption = (a: unknown): DateOption =>
  !isRecord(a)
    ? d
    : {
        id: Obj.hasKeyValue(a, 'id', isString) ? a.id : d.id,
        label: Obj.hasKeyValue(a, 'label', isString) ? a.label : d.label,
      };
