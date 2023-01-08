import {
  Arr,
  DateUtils,
  isNumber,
  isRecord,
  isString,
  Obj,
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
  timezoneOffsetMinutes: DateUtils.today().getTimezoneOffset(),
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
  Arr.isArray(e) && Arr.isArrayOfLength1OrMore(e) && e.every(isDatetimeRange);

const isUserList = (e: unknown): e is User[] =>
  Arr.isArray(e) && e.every(isUser);

export const isEventSchedule = (a: unknown): a is EventSchedule =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'title', isString) &&
  Obj.hasKeyValue(a, 'notes', isString) &&
  Obj.hasKeyValue(
    a,
    'datetimeSpecification',
    isDatetimeSpecificationEnumType
  ) &&
  Obj.hasKeyValue(a, 'datetimeRangeList', isDatetimeRangeList) &&
  Obj.hasKeyValue(a, 'answerDeadline', isAnswerDeadline) &&
  Obj.hasKeyValue(a, 'answerIcons', isAnswerIconSettings) &&
  Obj.hasKeyValue(a, 'notificationSettings', isNotificationSettingsWithNone) &&
  Obj.hasKeyValue(a, 'timezoneOffsetMinutes', isNumber) &&
  Obj.hasKeyValue(a, 'author', isUser) &&
  Obj.hasKeyValue(a, 'archivedBy', isUserList);

const d = eventScheduleDefaultValue;

export const fillEventSchedule = (a?: unknown): EventSchedule =>
  a === undefined || !isRecord(a)
    ? d
    : {
        title: Obj.hasKeyValue(a, 'title', isString) ? a.title : d.title,
        notes: Obj.hasKeyValue(a, 'notes', isString) ? a.notes : d.notes,

        datetimeSpecification: Obj.hasKeyValue(
          a,
          'datetimeSpecification',
          isDatetimeSpecificationEnumType
        )
          ? a.datetimeSpecification
          : d.datetimeSpecification,

        datetimeRangeList: Obj.hasKey(a, 'datetimeRangeList')
          ? Arr.isArray(a.datetimeRangeList) &&
            Arr.isArrayOfLength1OrMore(a.datetimeRangeList)
            ? Arr.map(a.datetimeRangeList, fillDatetimeRange)
            : d.datetimeRangeList
          : d.datetimeRangeList,

        answerDeadline: Obj.hasKey(a, 'answerDeadline')
          ? a.answerDeadline === 'none'
            ? 'none'
            : fillYmdhm(a.answerDeadline)
          : d.answerDeadline,

        answerIcons: Obj.hasKey(a, 'answerIcons')
          ? fillAnswerIconSettings(a.answerIcons)
          : d.answerIcons,

        notificationSettings: Obj.hasKey(a, 'notificationSettings')
          ? a.notificationSettings === 'none'
            ? 'none'
            : fillNotificationSettings(a.notificationSettings)
          : d.notificationSettings,

        timezoneOffsetMinutes: Obj.hasKeyValue(
          a,
          'timezoneOffsetMinutes',
          isNumber
        )
          ? a.timezoneOffsetMinutes
          : d.timezoneOffsetMinutes,

        author: Obj.hasKey(a, 'author') ? fillUser(a.author) : d.author,

        archivedBy: Obj.hasKey(a, 'archivedBy')
          ? Arr.isArray(a.archivedBy)
            ? Arr.map(a.archivedBy, fillUser)
            : d.archivedBy
          : d.archivedBy,
      };
