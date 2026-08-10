import * as t from '@noshiro/io-ts';
import { DatetimeRange, Ymdhm } from '@noshiro/io-ts-types';
import { DateUtils } from '@noshiro/ts-utils';
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
  answerDeadline: t.union([t.stringLiteral('none'), Ymdhm]),
  answerIcons: AnswerIconSettings,
  notificationSettings: t.union(
    [t.stringLiteral('none'), NotificationSettings],
    {
      defaultType: t.stringLiteral('none'),
    },
  ),
  timezoneOffsetMinutes: t.number(DateUtils.today().getTimezoneOffset()),
  author: User,
  archivedBy: t.array(User),
});

export type EventSchedule = t.TypeOf<typeof EventSchedule>;
