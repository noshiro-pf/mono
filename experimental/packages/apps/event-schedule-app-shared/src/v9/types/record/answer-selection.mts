import * as t from '@noshiro/io-ts';
import { DatetimeRange } from '@noshiro/io-ts-types';
import {
  AnswerIconIdWithNone,
  createAnswerIconPointType,
} from '../enum/index.mjs';

export const AnswerSelection = t.record({
  datetimeRange: DatetimeRange,
  iconId: AnswerIconIdWithNone,
  point: createAnswerIconPointType(0),
  comment: t.string(''),
});

export type AnswerSelection = t.TypeOf<typeof AnswerSelection>;
