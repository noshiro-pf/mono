import {
  hasKey,
  hasKeyValue,
  isNonNullObject,
  isString,
} from '@noshiro/ts-utils';
import type { AnswerIconIdWithNone, AnswerIconPoint } from '../enum';
import { isAnswerIconIdWithNone, isAnswerIconPoint } from '../enum';
import type { DatetimeRange } from './datetime-range';
import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
} from './datetime-range';

export type AnswerSelection = Readonly<{
  datetimeRange: DatetimeRange;
  iconId: AnswerIconIdWithNone;
  point: AnswerIconPoint;
  comment: string;
}>;

export const answerSelectionDefaultValue: AnswerSelection = {
  datetimeRange: datetimeRangeDefaultValue,
  iconId: 'none',
  point: 0,
  comment: '',
} as const;

export const isAnswerSelection = (a: unknown): a is AnswerSelection =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'datetimeRange', isDatetimeRange) &&
  hasKeyValue(a, 'iconId', isAnswerIconIdWithNone) &&
  hasKeyValue(a, 'point', isAnswerIconPoint) &&
  hasKeyValue(a, 'comment', isString);

const d = answerSelectionDefaultValue;

export const fillAnswerSelection = (a?: unknown): AnswerSelection =>
  !isNonNullObject(a)
    ? d
    : {
        datetimeRange: hasKey(a, 'datetimeRange')
          ? fillDatetimeRange(a.datetimeRange)
          : d.datetimeRange,

        iconId: hasKeyValue(a, 'iconId', isAnswerIconIdWithNone)
          ? a.iconId
          : d.iconId,

        point: hasKeyValue(a, 'point', isAnswerIconPoint) ? a.point : d.point,

        comment: hasKeyValue(a, 'comment', isString) ? a.comment : d.comment,
      };
