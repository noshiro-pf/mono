import {
  defaultDatetimeRange,
  fillDatetimeRange,
  type DatetimeRange,
  type PartialDatetimeRange,
} from '../../../v3';
import { type AnswerIconIdWithNone, type AnswerIconPoint } from '../enum';

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
