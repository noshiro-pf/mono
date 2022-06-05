import { IRecord, isRecord, isString } from '@noshiro/ts-utils';
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
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'datetimeRange', isDatetimeRange) &&
  IRecord.hasKeyValue(a, 'iconId', isAnswerIconIdWithNone) &&
  IRecord.hasKeyValue(a, 'point', isAnswerIconPoint) &&
  IRecord.hasKeyValue(a, 'comment', isString);

const d = answerSelectionDefaultValue;

export const fillAnswerSelection = (a?: unknown): AnswerSelection =>
  a === undefined || !isRecord(a)
    ? d
    : {
        datetimeRange: IRecord.hasKey(a, 'datetimeRange')
          ? fillDatetimeRange(a.datetimeRange)
          : d.datetimeRange,

        iconId: IRecord.hasKeyValue(a, 'iconId', isAnswerIconIdWithNone)
          ? a.iconId
          : d.iconId,

        point: IRecord.hasKeyValue(a, 'point', isAnswerIconPoint)
          ? a.point
          : d.point,

        comment: IRecord.hasKeyValue(a, 'comment', isString)
          ? a.comment
          : d.comment,
      };
