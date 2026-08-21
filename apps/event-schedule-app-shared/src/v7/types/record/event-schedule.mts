import { DateUtils } from 'io-ts-types';
import * as t from 'ts-fortress';
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
  answerDeadline: t.union([t.literal('none'), ymdhmTypeDef]),
  answerIcons: answerIconSettingsTypeDef,
  notificationSettings: t.union(
    [t.literal('none'), notificationSettingsTypeDef],
    {
      defaultType: t.literal('none'),
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
