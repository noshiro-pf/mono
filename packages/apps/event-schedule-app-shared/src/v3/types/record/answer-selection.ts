import {
  defaultDatetimeRange,
  fillDatetimeRange,
  type DatetimeRange,
  type PartialDatetimeRange,
} from '../../../v2';
import { type AnswerSymbolIdWithNone, type AnswerSymbolPoint } from '../enum';

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

const defaultAnswerSelection = {
  datetimeRange: defaultDatetimeRange,
  iconId: 'none',
  point: 0,
} as const satisfies AnswerSelection;

const d = defaultAnswerSelection;
export const fillAnswerSelection = (
  p?: PartialAnswerSelection
): AnswerSelection => ({
  datetimeRange: fillDatetimeRange(p?.datetimeRange ?? d.datetimeRange),
  iconId: p?.iconId ?? d.iconId,
  point: p?.point ?? d.point,
});
