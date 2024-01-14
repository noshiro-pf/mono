import * as t from '@noshiro/io-ts';
import {
  answerIconIdWithNoneTypeDef,
  answerIconPointTypeDef,
} from '../enum/index.mjs';
import { datetimeRangeTypeDef } from './datetime-range.mjs';

export const answerSelectionTypeDef = t.record({
  datetimeRange: datetimeRangeTypeDef,
  iconId: answerIconIdWithNoneTypeDef,
  point: answerIconPointTypeDef(0),
  comment: t.string(''),
});

export type AnswerSelection = t.TypeOf<typeof answerSelectionTypeDef>;

export const answerSelectionDefaultValue = answerSelectionTypeDef.defaultValue;

export const isAnswerSelection = answerSelectionTypeDef.is;

export const fillAnswerSelection = answerSelectionTypeDef.fill;
