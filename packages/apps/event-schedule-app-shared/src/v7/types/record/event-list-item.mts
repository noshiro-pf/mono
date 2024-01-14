import * as t from '@noshiro/io-ts';
import { answerTypeDef } from './answer.mjs';
import { eventScheduleTypeDef } from './event-schedule.mjs';

export const eventListItemTypeDef = t.record({
  eventSchedule: eventScheduleTypeDef,
  eventScheduleMetadata: t.record({
    id: t.string(''),
    createdAt: t.string(''),
    updatedAt: t.string(''),
  }),

  answers: t.array(answerTypeDef),
  answersMetadata: t.record({
    lastUpdate: t.string(''),
  }),
});

export type EventListItem = t.TypeOf<typeof eventListItemTypeDef>;

export const eventListItemDefaultValue = eventListItemTypeDef.defaultValue;

export const isEventListItem = eventListItemTypeDef.is;

export const fillEventListItem = eventListItemTypeDef.fill;
