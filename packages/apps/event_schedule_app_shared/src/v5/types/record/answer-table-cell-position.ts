import type { DatetimeRange } from '../../../v4';
import type { AnswerId } from '../named-primitive-types';

export type AnswerTableCellPosition = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;
