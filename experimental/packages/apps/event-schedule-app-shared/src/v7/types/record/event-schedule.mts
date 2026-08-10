import * as t from '@noshiro/io-ts';
import { DateUtils } from '@noshiro/ts-utils';
import { datetimeSpecificationTypeDef } from '../enum/index.mjs';
import { answerIconSettingsTypeDef } from './answer-icon-settings.mjs';
import {
  notificationSettingsTypeDef,
  userTypeDef,
  ymdhmTypeDef,
} from './base/index.mjs';
import {
  datetimeRangeDefaultValue,
  datetimeRangeTypeDef,
} from './datetime-range.mjs';

export const eventScheduleTypeDef = t.record({
  title: t.string(''),
  notes: t.string(''),
  datetimeSpecification: datetimeSpecificationTypeDef,
  datetimeRangeList: t.nonEmptyArray(datetimeRangeTypeDef, {
    defaultValue: [datetimeRangeDefaultValue],
  }),
  answerDeadline: t.union([t.stringLiteral('none'), ymdhmTypeDef]),
  answerIcons: answerIconSettingsTypeDef,
  notificationSettings: t.union(
    [t.stringLiteral('none'), notificationSettingsTypeDef],
    {
      defaultType: t.stringLiteral('none'),
    },
  ),
  timezoneOffsetMinutes: t.number(DateUtils.today().getTimezoneOffset()),
  author: userTypeDef,
  archivedBy: t.array(userTypeDef),
});

export type EventSchedule = t.TypeOf<typeof eventScheduleTypeDef>;

export const eventScheduleDefaultValue = eventScheduleTypeDef.defaultValue;

export const isEventSchedule = eventScheduleTypeDef.is;

export const fillEventSchedule = eventScheduleTypeDef.fill;
