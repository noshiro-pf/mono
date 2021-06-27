import type { AnswerId } from '../phantom';
import type { DatetimeRange } from './datetime-range';

export type AnswerTableCellPosition = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;
