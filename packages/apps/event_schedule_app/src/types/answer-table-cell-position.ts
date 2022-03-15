import type {
  AnswerId,
  DatetimeRange,
} from '@noshiro/event-schedule-app-shared';

export type AnswerTableCellPosition = Readonly<{
  answerId: AnswerId;
  datetimeRange: DatetimeRange;
}>;
