import { DateUtils, DatetimeRange, Ymdhm } from 'io-ts-types';
import * as t from 'ts-fortress';
import { DatetimeSpecificationEnumType } from '../enum/index.mjs';
import { AnswerIconSettings } from './answer-icon-settings.mjs';
import { NotificationSettings, User } from './base/index.mjs';

export const EventSchedule = t.record({
  title: t.string(''),
  notes: t.string(''),
  datetimeSpecification: DatetimeSpecificationEnumType,
  datetimeRangeList: t.nonEmptyArray(DatetimeRange, {
    defaultValue: [DatetimeRange.defaultValue],
  }),
  answerDeadline: t.union([t.literal('none'), Ymdhm]),
  answerIcons: AnswerIconSettings,
  notificationSettings: t.union([t.literal('none'), NotificationSettings], {
    defaultType: t.literal('none'),
  }),
  timezoneOffsetMinutes: t.number(DateUtils.today().getTimezoneOffset()),
  author: User,
  archivedBy: t.array(User),
});

export type EventSchedule = t.TypeOf<typeof EventSchedule>;
