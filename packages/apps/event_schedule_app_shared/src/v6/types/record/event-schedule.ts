import {
  hasKey,
  hasKeyValue,
  IDate,
  IList,
  isNonNullObject,
  isNumber,
  isString,
} from '@noshiro/ts-utils';
import type { DatetimeSpecificationEnumType } from '../enum';
import { isDatetimeSpecificationEnumType } from '../enum';
import type { AnswerIconSettings } from './answer-icon-settings';
import {
  fillAnswerIconSettings,
  isAnswerIconSettings,
} from './answer-icon-settings';
import type { NotificationSettings, User, Ymdhm } from './base';
import {
  answerIconSettingDefaultValue,
  fillNotificationSettings,
  fillUser,
  fillYmdhm,
  isNotificationSettings,
  isUser,
  isYmdhm,
  userDefaultValue,
} from './base';
import type { DatetimeRange } from './datetime-range';
import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
} from './datetime-range';

export type EventSchedule = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: NonEmptyArray<DatetimeRange>;
  answerDeadline: Ymdhm | 'none';
  answerIcons: AnswerIconSettings;
  notificationSettings: NotificationSettings | 'none';
  timezoneOffsetMinutes: number;
  author: User;
  archivedBy: readonly User[];
}>;

export const eventScheduleDefaultValue: EventSchedule = {
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: [datetimeRangeDefaultValue],
  answerDeadline: 'none',
  answerIcons: {
    good: answerIconSettingDefaultValue,
    fair: answerIconSettingDefaultValue,
    poor: answerIconSettingDefaultValue,
  },
  notificationSettings: 'none',
  timezoneOffsetMinutes: IDate.today().getTimezoneOffset(),
  author: userDefaultValue,
  archivedBy: [],
} as const;

const isAnswerDeadline = (e: unknown): e is Ymdhm | 'none' =>
  e === 'none' || isYmdhm(e);

const isNotificationSettingsWithNone = (
  e: unknown
): e is NotificationSettings | 'none' =>
  e === 'none' || isNotificationSettings(e);

const isDatetimeRangeList = (e: unknown): e is DatetimeRange[] =>
  IList.isArray(e) &&
  IList.isArrayOfLength1OrMore(e) &&
  e.every(isDatetimeRange);

const isUserList = (e: unknown): e is User[] =>
  IList.isArray(e) && e.every(isUser);

export const isEventSchedule = (a: unknown): a is EventSchedule =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'title', isString) &&
  hasKeyValue(a, 'notes', isString) &&
  hasKeyValue(a, 'datetimeSpecification', isDatetimeSpecificationEnumType) &&
  hasKeyValue(a, 'datetimeRangeList', isDatetimeRangeList) &&
  hasKeyValue(a, 'answerDeadline', isAnswerDeadline) &&
  hasKeyValue(a, 'answerIcons', isAnswerIconSettings) &&
  hasKeyValue(a, 'notificationSettings', isNotificationSettingsWithNone) &&
  hasKeyValue(a, 'timezoneOffsetMinutes', isNumber) &&
  hasKeyValue(a, 'author', isUser) &&
  hasKeyValue(a, 'archivedBy', isUserList);

const d = eventScheduleDefaultValue;

export const fillEventSchedule = (a?: unknown): EventSchedule =>
  !isNonNullObject(a)
    ? d
    : {
        title: hasKeyValue(a, 'title', isString) ? a.title : d.title,
        notes: hasKeyValue(a, 'notes', isString) ? a.notes : d.notes,

        datetimeSpecification: hasKeyValue(
          a,
          'datetimeSpecification',
          isDatetimeSpecificationEnumType
        )
          ? a.datetimeSpecification
          : d.datetimeSpecification,

        datetimeRangeList: hasKey(a, 'datetimeRangeList')
          ? IList.isArray(a.datetimeRangeList) &&
            IList.isArrayOfLength1OrMore(a.datetimeRangeList)
            ? IList.map(a.datetimeRangeList, fillDatetimeRange)
            : d.datetimeRangeList
          : d.datetimeRangeList,

        answerDeadline: hasKey(a, 'answerDeadline')
          ? a.answerDeadline === 'none'
            ? 'none'
            : fillYmdhm(a.answerDeadline)
          : d.answerDeadline,

        answerIcons: hasKey(a, 'answerIcons')
          ? fillAnswerIconSettings(a.answerIcons)
          : d.answerIcons,

        notificationSettings: hasKey(a, 'notificationSettings')
          ? a.notificationSettings === 'none'
            ? 'none'
            : fillNotificationSettings(a.notificationSettings)
          : d.notificationSettings,

        timezoneOffsetMinutes: hasKeyValue(a, 'timezoneOffsetMinutes', isNumber)
          ? a.timezoneOffsetMinutes
          : d.timezoneOffsetMinutes,

        author: hasKey(a, 'author') ? fillUser(a.author) : d.author,

        archivedBy: hasKey(a, 'archivedBy')
          ? IList.isArray(a.archivedBy)
            ? IList.map(a.archivedBy, fillUser)
            : d.archivedBy
          : d.archivedBy,
      };
