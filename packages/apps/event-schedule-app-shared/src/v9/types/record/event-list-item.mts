import * as t from '@noshiro/io-ts';
import { Answer } from './answer.mjs';
import { EventSchedule } from './event-schedule.mjs';

export const EventListItem = t.record({
  eventSchedule: EventSchedule,
  eventScheduleMetadata: t.record({
    id: t.string(''),
    createdAt: t.string(''),
    createdAtMillis: t.optional(t.number(0)),
    updatedAt: t.string(''),
    updatedAtMillis: t.optional(t.number(0)),
  }),

  answers: t.array(Answer),
  answersMetadata: t.record({
    lastUpdate: t.string(''),
  }),
});

export type EventListItem = t.TypeOf<typeof EventListItem>;
