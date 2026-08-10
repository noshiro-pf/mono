import {
  Arr,
  DateUtils,
  isNumber,
  isRecord,
  isString,
  Obj,
  Tpl,
} from '@noshiro/ts-utils';
import {
  isDatetimeSpecificationEnumType,
  type DatetimeSpecificationEnumType,
} from '../enum/index.mjs';
import {
  fillAnswerIconSettings,
  isAnswerIconSettings,
  type AnswerIconSettings,
} from './answer-icon-settings.mjs';
import {
  answerIconSettingDefaultValue,
  fillNotificationSettings,
  fillUser,
  fillYmdhm,
  isNotificationSettings,
  isUser,
  isYmdhm,
  userDefaultValue,
  type NotificationSettings,
  type User,
  type Ymdhm,
} from './base/index.mjs';
import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
  type DatetimeRange,
} from './datetime-range.mjs';

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

export const eventScheduleDefaultValue = {
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
} as const satisfies EventSchedule;

const isAnswerDeadline = (e: unknown): e is Ymdhm | 'none' =>
  e === 'none' || isYmdhm(e);

const isNotificationSettingsWithNone = (
  e: unknown,
): e is NotificationSettings | 'none' =>
  e === 'none' || isNotificationSettings(e);

const isDatetimeRangeList = (e: unknown): e is DatetimeRange[] =>
  Array.isArray(e) && Arr.isArrayOfLength1OrMore(e) && e.every(isDatetimeRange);

const isUserList = (e: unknown): e is User[] =>
  Array.isArray(e) && e.every(isUser);

export const isEventSchedule = (a: unknown): a is EventSchedule =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'title', isString) &&
  Obj.hasKeyValue(a, 'notes', isString) &&
  Obj.hasKeyValue(
    a,
    'datetimeSpecification',
    isDatetimeSpecificationEnumType,
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
          isDatetimeSpecificationEnumType,
        )
          ? a.datetimeSpecification
          : d.datetimeSpecification,

        datetimeRangeList: Object.hasOwn(a, 'datetimeRangeList')
          ? Array.isArray(a.datetimeRangeList) &&
            Arr.isArrayOfLength1OrMore(a.datetimeRangeList)
            ? Tpl.map(a.datetimeRangeList, fillDatetimeRange)
            : d.datetimeRangeList
          : d.datetimeRangeList,

        answerDeadline: Object.hasOwn(a, 'answerDeadline')
          ? a.answerDeadline === 'none'
            ? 'none'
            : fillYmdhm(a.answerDeadline)
          : d.answerDeadline,

        answerIcons: Object.hasOwn(a, 'answerIcons')
          ? fillAnswerIconSettings(a.answerIcons)
          : d.answerIcons,

        notificationSettings: Object.hasOwn(a, 'notificationSettings')
          ? a.notificationSettings === 'none'
            ? 'none'
            : fillNotificationSettings(a.notificationSettings)
          : d.notificationSettings,

        timezoneOffsetMinutes: Obj.hasKeyValue(
          a,
          'timezoneOffsetMinutes',
          isNumber,
        )
          ? a.timezoneOffsetMinutes
          : d.timezoneOffsetMinutes,

        author: Object.hasOwn(a, 'author') ? fillUser(a.author) : d.author,

        archivedBy: Object.hasOwn(a, 'archivedBy')
          ? Array.isArray(a.archivedBy)
            ? a.archivedBy.map(fillUser)
            : d.archivedBy
          : d.archivedBy,
      };
