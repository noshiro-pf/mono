import type { DatetimeRange, PartialDatetimeRange } from '../../../v2';
import { defaultDatetimeRange, fillDatetimeRange } from '../../../v2';
import type { AnswerSymbolIdWithNone, AnswerSymbolPoint } from '../enum';

export type AnswerSelection = Readonly<{
  datetimeRange: DatetimeRange;
  iconId: AnswerSymbolIdWithNone;
  point: AnswerSymbolPoint;
}>;

export type PartialAnswerSelection = Partial<
  Readonly<{
    datetimeRange: PartialDatetimeRange;
    iconId: AnswerSymbolIdWithNone;
    point: AnswerSymbolPoint;
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
