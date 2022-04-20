import type {
  AnswerIconIdWithNone,
  AnswerIconPoint,
  DatetimeRange,
  PartialDatetimeRange,
} from '../../v5';
import { datetimeRangeDefaultValue, fillDatetimeRange } from '../../v5';

export type AnswerSelection = Readonly<{
  datetimeRange: DatetimeRange;
  iconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
  comment: string;
}>;

export type PartialAnswerSelection = Partial<
  Pick<AnswerSelection, 'comment' | 'iconId' | 'point'> &
    Readonly<{
      datetimeRange: PartialDatetimeRange;
    }>
>;

const defaultAnswerSelection: AnswerSelection = {
  datetimeRange: datetimeRangeDefaultValue,
  iconId: 'none',
  point: 0,
  comment: '',
} as const;

const d = defaultAnswerSelection;
export const fillAnswerSelection = (
  p?: PartialAnswerSelection
): AnswerSelection => ({
  datetimeRange: fillDatetimeRange(p?.datetimeRange ?? d.datetimeRange),
  iconId: p?.iconId ?? d.iconId,
  point: p?.point ?? d.point,
  comment: p?.comment ?? d.comment,
});
