import { type AnswerId } from '../phantom.mjs';
import { type DatetimeRange } from './datetime-range.mjs';

export type AnswerTableCellPosition = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;
