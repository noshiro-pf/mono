import { DatetimeSpecificationEnumType } from '../enum/datetime-specification-type';
import { AnswerSymbolType } from './base/answer-symbol';
import { NotificationSettingsJsType } from './base/notification-settings';
import { DatetimeRangeJsType } from './datetime-range';
import { YmdHmJsType } from './ymd-hm';

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
