import { isRecord, isString, Obj } from '@noshiro/ts-utils';
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
  Obj.hasKeyValue(a, 'datetimeRange', isDatetimeRange) &&
  Obj.hasKeyValue(a, 'iconId', isAnswerIconIdWithNone) &&
  Obj.hasKeyValue(a, 'point', isAnswerIconPoint) &&
  Obj.hasKeyValue(a, 'comment', isString);

const d = answerSelectionDefaultValue;

export const fillAnswerSelection = (a?: unknown): AnswerSelection =>
  a === undefined || !isRecord(a)
    ? d
    : {
        datetimeRange: Object.hasOwn(a, 'datetimeRange')
          ? fillDatetimeRange(a.datetimeRange)
          : d.datetimeRange,

        iconId: Obj.hasKeyValue(a, 'iconId', isAnswerIconIdWithNone)
          ? a.iconId
          : d.iconId,

        point: Obj.hasKeyValue(a, 'point', isAnswerIconPoint)
          ? a.point
          : d.point,

        comment: Obj.hasKeyValue(a, 'comment', isString)
          ? a.comment
          : d.comment,
      };
