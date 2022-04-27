import {
  hasKey,
  hasKeyValue,
  IList,
  isNonNullObject,
  isString,
} from '@noshiro/ts-utils';
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
  isNonNullObject(a) &&
  hasKeyValue(a, 'id', isString) &&
  hasKeyValue(a, 'createdAt', isString) &&
  hasKeyValue(a, 'updatedAt', isString);

const isAnswersMetadata = (a: unknown): a is EventListItem['answersMetadata'] =>
  isNonNullObject(a) && hasKeyValue(a, 'lastUpdate', isString);

export const isEventListItem = (a: unknown): a is EventListItem =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'eventSchedule', isEventSchedule) &&
  hasKeyValue(a, 'eventScheduleMetadata', isEventScheduleMetadata) &&
  hasKeyValue(
    a,
    'answers',
    (e: unknown): e is Answer[] => IList.isArray(e) && e.every(isAnswer)
  ) &&
  hasKeyValue(a, 'answersMetadata', isAnswersMetadata);

const d = eventListItemDefaultValue;

const fillEventScheduleMetadata = (
  a: unknown
): EventListItem['eventScheduleMetadata'] =>
  !isNonNullObject(a)
    ? d.eventScheduleMetadata
    : {
        id: hasKeyValue(a, 'id', isString) ? a.id : d.eventScheduleMetadata.id,

        createdAt: hasKeyValue(a, 'createdAt', isString)
          ? a.createdAt
          : d.eventScheduleMetadata.createdAt,

        updatedAt: hasKeyValue(a, 'updatedAt', isString)
          ? a.updatedAt
          : d.eventScheduleMetadata.updatedAt,
      };

const fillAnswersMetadata = (a: unknown): EventListItem['answersMetadata'] =>
  !isNonNullObject(a)
    ? d.answersMetadata
    : {
        lastUpdate: hasKeyValue(a, 'lastUpdate', isString)
          ? a.lastUpdate
          : d.answersMetadata.lastUpdate,
      };

export const fillEventListItem = (a?: unknown): EventListItem =>
  !isNonNullObject(a)
    ? d
    : {
        eventSchedule: hasKey(a, 'eventSchedule')
          ? fillEventSchedule(a.eventSchedule)
          : d.eventSchedule,

        eventScheduleMetadata: hasKey(a, 'eventScheduleMetadata')
          ? fillEventScheduleMetadata(a.eventScheduleMetadata)
          : d.eventScheduleMetadata,

        answers: hasKey(a, 'answers')
          ? IList.isArray(a.answers)
            ? a.answers.map(fillAnswer)
            : d.answers
          : d.answers,

        answersMetadata: hasKey(a, 'answersMetadata')
          ? fillAnswersMetadata(a.answersMetadata)
          : d.answersMetadata,
      };
