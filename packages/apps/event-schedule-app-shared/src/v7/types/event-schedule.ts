import {
  IDate,
  IList,
  IRecord,
  isNumber,
  isRecord,
  isString,
} from '@noshiro/ts-utils';
import type {
  AnswerIconSettings,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  User,
  Ymdhm,
} from '../../v6';
import {
  answerIconSettingDefaultValue,
  datetimeRangeDefaultValue,
  fillAnswerIconSettings,
  fillDatetimeRange,
  fillUser,
  fillYmdhm,
  isAnswerIconSettings,
  isDatetimeRange,
  isDatetimeSpecificationEnumType,
  isUser,
  isYmdhm,
  userDefaultValue,
} from '../../v6';
import type { NotificationSettings } from './base';
import { fillNotificationSettings, isNotificationSettings } from './base';

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
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'title', isString) &&
  IRecord.hasKeyValue(a, 'notes', isString) &&
  IRecord.hasKeyValue(
    a,
    'datetimeSpecification',
    isDatetimeSpecificationEnumType
  ) &&
  IRecord.hasKeyValue(a, 'datetimeRangeList', isDatetimeRangeList) &&
  IRecord.hasKeyValue(a, 'answerDeadline', isAnswerDeadline) &&
  IRecord.hasKeyValue(a, 'answerIcons', isAnswerIconSettings) &&
  IRecord.hasKeyValue(
    a,
    'notificationSettings',
    isNotificationSettingsWithNone
  ) &&
  IRecord.hasKeyValue(a, 'timezoneOffsetMinutes', isNumber) &&
  IRecord.hasKeyValue(a, 'author', isUser) &&
  IRecord.hasKeyValue(a, 'archivedBy', isUserList);

const d = eventScheduleDefaultValue;

export const fillEventSchedule = (a?: unknown): EventSchedule =>
  a === undefined || !isRecord(a)
    ? d
    : {
        title: IRecord.hasKeyValue(a, 'title', isString) ? a.title : d.title,
        notes: IRecord.hasKeyValue(a, 'notes', isString) ? a.notes : d.notes,

        datetimeSpecification: IRecord.hasKeyValue(
          a,
          'datetimeSpecification',
          isDatetimeSpecificationEnumType
        )
          ? a.datetimeSpecification
          : d.datetimeSpecification,

        datetimeRangeList: IRecord.hasKey(a, 'datetimeRangeList')
          ? IList.isArray(a.datetimeRangeList) &&
            IList.isArrayOfLength1OrMore(a.datetimeRangeList)
            ? IList.map(a.datetimeRangeList, fillDatetimeRange)
            : d.datetimeRangeList
          : d.datetimeRangeList,

        answerDeadline: IRecord.hasKey(a, 'answerDeadline')
          ? a.answerDeadline === 'none'
            ? 'none'
            : fillYmdhm(a.answerDeadline)
          : d.answerDeadline,

        answerIcons: IRecord.hasKey(a, 'answerIcons')
          ? fillAnswerIconSettings(a.answerIcons)
          : d.answerIcons,

        notificationSettings: IRecord.hasKey(a, 'notificationSettings')
          ? a.notificationSettings === 'none'
            ? 'none'
            : fillNotificationSettings(a.notificationSettings)
          : d.notificationSettings,

        timezoneOffsetMinutes: IRecord.hasKeyValue(
          a,
          'timezoneOffsetMinutes',
          isNumber
        )
          ? a.timezoneOffsetMinutes
          : d.timezoneOffsetMinutes,

        author: IRecord.hasKey(a, 'author') ? fillUser(a.author) : d.author,

        archivedBy: IRecord.hasKey(a, 'archivedBy')
          ? IList.isArray(a.archivedBy)
            ? IList.map(a.archivedBy, fillUser)
            : d.archivedBy
          : d.archivedBy,
      };