import { Arr, isRecord, isString, Obj } from '@noshiro/ts-utils';
import type { Answer } from './answer';
import { fillAnswer, isAnswer } from './answer';
import type { EventSchedule } from './event-schedule';
import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
} from './event-schedule';

export type EventListItem = Readonly<{
  eventSchedule: EventSchedule;
  eventScheduleMetadata: Readonly<{
    id: string;
    createdAt: string;
    updatedAt: string;
  }>;

  answers: readonly Answer[];
  answersMetadata: Readonly<{
    lastUpdate: string;
  }>;
}>;

export const eventListItemDefaultValue: EventListItem = {
  eventSchedule: eventScheduleDefaultValue,
  eventScheduleMetadata: {
    id: '',
    createdAt: '',
    updatedAt: '',
  },
  answers: [],
  answersMetadata: {
    lastUpdate: '',
  },
} as const;

const isEventScheduleMetadata = (
  a: unknown
): a is EventListItem['eventScheduleMetadata'] =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'id', isString) &&
  Obj.hasKeyValue(a, 'createdAt', isString) &&
  Obj.hasKeyValue(a, 'updatedAt', isString);

const isAnswersMetadata = (a: unknown): a is EventListItem['answersMetadata'] =>
  isRecord(a) && Obj.hasKeyValue(a, 'lastUpdate', isString);

export const isEventListItem = (a: unknown): a is EventListItem =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'eventSchedule', isEventSchedule) &&
  Obj.hasKeyValue(a, 'eventScheduleMetadata', isEventScheduleMetadata) &&
  Obj.hasKeyValue(
    a,
    'answers',
    (e: unknown): e is Answer[] => Arr.isArray(e) && e.every(isAnswer)
  ) &&
  Obj.hasKeyValue(a, 'answersMetadata', isAnswersMetadata);

const d = eventListItemDefaultValue;

const fillEventScheduleMetadata = (
  a: unknown
): EventListItem['eventScheduleMetadata'] =>
  !isRecord(a)
    ? d.eventScheduleMetadata
    : {
        id: Obj.hasKeyValue(a, 'id', isString)
          ? a.id
          : d.eventScheduleMetadata.id,

        createdAt: Obj.hasKeyValue(a, 'createdAt', isString)
          ? a.createdAt
          : d.eventScheduleMetadata.createdAt,

        updatedAt: Obj.hasKeyValue(a, 'updatedAt', isString)
          ? a.updatedAt
          : d.eventScheduleMetadata.updatedAt,
      };

const fillAnswersMetadata = (a: unknown): EventListItem['answersMetadata'] =>
  !isRecord(a)
    ? d.answersMetadata
    : {
        lastUpdate: Obj.hasKeyValue(a, 'lastUpdate', isString)
          ? a.lastUpdate
          : d.answersMetadata.lastUpdate,
      };

export const fillEventListItem = (a?: unknown): EventListItem =>
  a === undefined || !isRecord(a)
    ? d
    : {
        eventSchedule: Obj.hasKey(a, 'eventSchedule')
          ? fillEventSchedule(a.eventSchedule)
          : d.eventSchedule,

        eventScheduleMetadata: Obj.hasKey(a, 'eventScheduleMetadata')
          ? fillEventScheduleMetadata(a.eventScheduleMetadata)
          : d.eventScheduleMetadata,

        answers: Obj.hasKey(a, 'answers')
          ? Arr.isArray(a.answers)
            ? a.answers.map(fillAnswer)
            : d.answers
          : d.answers,

        answersMetadata: Obj.hasKey(a, 'answersMetadata')
          ? fillAnswersMetadata(a.answersMetadata)
          : d.answersMetadata,
      };
