import * as t from '@noshiro/io-ts';
import { IDate } from '@noshiro/ts-utils';
import { datetimeSpecificationTypeDef } from '../enum';
import { answerIconSettingsTypeDef } from './answer-icon-settings';
import { notificationSettingsTypeDef, userTypeDef, ymdhmTypeDef } from './base';
import {
  datetimeRangeDefaultValue,
  datetimeRangeTypeDef,
} from './datetime-range';

export const eventScheduleTypeDef = t.record({
  title: t.string(''),
  notes: t.string(''),
  datetimeSpecification: datetimeSpecificationTypeDef,
  datetimeRangeList: t.nonEmptyArray({
    elementType: datetimeRangeTypeDef,
    defaultValue: [datetimeRangeDefaultValue],
  }),
  answerDeadline: t.union({
    types: [t.stringLiteral('none'), ymdhmTypeDef],
    defaultType: t.stringLiteral('none'),
  }),
  answerIcons: answerIconSettingsTypeDef,
  notificationSettings: t.union({
    types: [t.stringLiteral('none'), notificationSettingsTypeDef],
    defaultType: t.stringLiteral('none'),
  }),
  timezoneOffsetMinutes: t.number(IDate.today().getTimezoneOffset()),
  author: userTypeDef,
  archivedBy: t.array({ elementType: userTypeDef }),
});

export type EventSchedule = t.Typeof<typeof eventScheduleTypeDef>;

export const eventScheduleDefaultValue = eventScheduleTypeDef.defaultValue;

export const isEventSchedule = eventScheduleTypeDef.is;

export const fillEventSchedule = eventScheduleTypeDef.fill;