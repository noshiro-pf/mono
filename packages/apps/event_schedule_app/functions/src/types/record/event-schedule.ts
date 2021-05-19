import type { DatetimeSpecificationEnumType } from '../enum';
import type { AnswerSymbolType, NotificationSettingsJsType } from './base';
import type { DatetimeRangeJsType } from './datetime-range';
import type { YmdHmJsType } from './ymd-hm';

export type EventScheduleJsType = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: readonly DatetimeRangeJsType[];
  useAnswerDeadline: boolean;
  answerDeadline: YmdHmJsType;
  usePassword: boolean;
  password: string;
  answerSymbolList: readonly AnswerSymbolType[];
  useNotification: boolean;
  notificationSettings: NotificationSettingsJsType;
}>;
