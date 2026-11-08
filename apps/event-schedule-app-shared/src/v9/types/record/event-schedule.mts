import * as t from 'ts-fortress';
import { DatetimeRange, Ymdhm } from 'ts-fortress-types';
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
  // A stored event always has one (`firestore.rules` require it), so the
  // default is only a placeholder: UTC, not the offset where and when this
  // module happened to load. The app writes the one it reads for the visit.
  timezoneOffsetMinutes: t.number(0),
  author: User,
  archivedBy: t.array(User),
});

export type EventSchedule = t.TypeOf<typeof EventSchedule>;
