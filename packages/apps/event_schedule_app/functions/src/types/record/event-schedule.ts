import type { DatetimeSpecificationEnumType } from '../enum/datetime-specification-type';
import type { AnswerSymbolType } from './base/answer-symbol';
import type { NotificationSettingsJsType } from './base/notification-settings';
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
