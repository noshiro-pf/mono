import { Arr, hasKey, isNumber, isRecord, isString } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { type NonEmptyArray } from 'ts-type-forge';
import { hasKeyValue } from '../../../utils/index.mjs';
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
  datetimeRangeList: Arr.asNonEmptyArray([datetimeRangeDefaultValue]),
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

const isDatetimeRangeList = (e: unknown): e is readonly DatetimeRange[] =>
  Arr.isArray(e) && Arr.isNonEmpty(e) && e.every(isDatetimeRange);

const isUserList = (e: unknown): e is readonly User[] =>
  Arr.isArray(e) && e.every(isUser);

export const isEventSchedule = (a: unknown): a is EventSchedule =>
  isRecord(a) &&
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
  a === undefined || !isRecord(a)
    ? d
    : ({
        title: hasKeyValue(a, 'title', isString) ? a.title : d.title,
        notes: hasKeyValue(a, 'notes', isString) ? a.notes : d.notes,

        datetimeSpecification: hasKeyValue(
          a,
          'datetimeSpecification',
          isDatetimeSpecificationEnumType,
        )
          ? a.datetimeSpecification
          : d.datetimeSpecification,

        datetimeRangeList:
          hasKey(a, 'datetimeRangeList') &&
          Arr.isArray(a.datetimeRangeList) &&
          Arr.isNonEmpty(a.datetimeRangeList)
            ? Arr.asNonEmptyArray(a.datetimeRangeList.map(fillDatetimeRange))
            : d.datetimeRangeList,

        answerDeadline: hasKey(a, 'answerDeadline')
          ? a.answerDeadline === 'none'
            ? ('none' as const)
            : fillYmdhm(a.answerDeadline)
          : d.answerDeadline,

        answerIcons: hasKey(a, 'answerIcons')
          ? fillAnswerIconSettings(a.answerIcons)
          : d.answerIcons,

        notificationSettings: hasKey(a, 'notificationSettings')
          ? a.notificationSettings === 'none'
            ? ('none' as const)
            : fillNotificationSettings(a.notificationSettings)
          : d.notificationSettings,

        timezoneOffsetMinutes: hasKeyValue(a, 'timezoneOffsetMinutes', isNumber)
          ? a.timezoneOffsetMinutes
          : d.timezoneOffsetMinutes,

        author: hasKey(a, 'author') ? fillUser(a.author) : d.author,

        archivedBy:
          hasKey(a, 'archivedBy') && Arr.isArray(a.archivedBy)
            ? a.archivedBy.map(fillUser)
            : d.archivedBy,
      } as const);
