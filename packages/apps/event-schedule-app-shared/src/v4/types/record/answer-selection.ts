import type { DatetimeRange, PartialDatetimeRange } from '../../../v3';
import { defaultDatetimeRange, fillDatetimeRange } from '../../../v3';
import type { AnswerIconIdWithNone, AnswerIconPoint } from '../enum';

export type AnswerSelection = Readonly<{
  datetimeRange: DatetimeRange;
  iconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
}>;

export type PartialAnswerSelection = Partial<
  Readonly<{
    datetimeRange: PartialDatetimeRange;
    iconId: AnswerIconIdWithNone;
    point: AnswerIconPoint;
  }>
>;

const defaultAnswerSelection: AnswerSelection = {
  datetimeRange: defaultDatetimeRange,
  iconId: 'none',
  point: 0,
} as const;

const d = defaultAnswerSelection;
export const fillAnswerSelection = (
  p?: PartialAnswerSelection
): AnswerSelection => ({
  datetimeRange: fillDatetimeRange(p?.datetimeRange ?? d.datetimeRange),
  iconId: p?.iconId ?? d.iconId,
  point: p?.point ?? d.point,
});