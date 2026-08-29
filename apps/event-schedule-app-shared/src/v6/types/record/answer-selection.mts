import { hasKey, isRecord, isString } from 'ts-data-forge';
import { hasKeyValue } from '../../../utils/index.mjs';
import {
  isAnswerIconIdWithNone,
  isAnswerIconPoint,
  type AnswerIconIdWithNone,
  type AnswerIconPoint,
} from '../enum/index.mjs';
import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
  type DatetimeRange,
} from './datetime-range.mjs';

export type AnswerSelection = Readonly<{
  datetimeRange: DatetimeRange;
  iconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
  comment: string;
}>;

export const answerSelectionDefaultValue = {
  datetimeRange: datetimeRangeDefaultValue,
  iconId: 'none',
  point: 0,
  comment: '',
} as const satisfies AnswerSelection;

export const isAnswerSelection = (a: unknown): a is AnswerSelection =>
  isRecord(a) &&
  hasKeyValue(a, 'datetimeRange', isDatetimeRange) &&
  hasKeyValue(a, 'iconId', isAnswerIconIdWithNone) &&
  hasKeyValue(a, 'point', isAnswerIconPoint) &&
  hasKeyValue(a, 'comment', isString);

const d = answerSelectionDefaultValue;

export const fillAnswerSelection = (a?: unknown): AnswerSelection =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        datetimeRange: hasKey(a, 'datetimeRange')
          ? fillDatetimeRange(a.datetimeRange)
          : d.datetimeRange,

        iconId: hasKeyValue(a, 'iconId', isAnswerIconIdWithNone)
          ? a.iconId
          : d.iconId,

        point: hasKeyValue(a, 'point', isAnswerIconPoint) ? a.point : d.point,

        comment: hasKeyValue(a, 'comment', isString) ? a.comment : d.comment,
      } as const);
