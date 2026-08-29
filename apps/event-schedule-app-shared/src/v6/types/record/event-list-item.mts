import { Arr, hasKey, isRecord, isString } from 'ts-data-forge';
import { hasKeyValue } from '../../../utils/index.mjs';
import { fillAnswer, isAnswer, type Answer } from './answer.mjs';
import {
  eventScheduleDefaultValue,
  fillEventSchedule,
  isEventSchedule,
  type EventSchedule,
} from './event-schedule.mjs';

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

export const eventListItemDefaultValue = {
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
} as const satisfies EventListItem;

const isEventScheduleMetadata = (
  a: unknown,
): a is EventListItem['eventScheduleMetadata'] =>
  isRecord(a) &&
  hasKeyValue(a, 'id', isString) &&
  hasKeyValue(a, 'createdAt', isString) &&
  hasKeyValue(a, 'updatedAt', isString);

const isAnswersMetadata = (a: unknown): a is EventListItem['answersMetadata'] =>
  isRecord(a) && hasKeyValue(a, 'lastUpdate', isString);

export const isEventListItem = (a: unknown): a is EventListItem =>
  isRecord(a) &&
  hasKeyValue(a, 'eventSchedule', isEventSchedule) &&
  hasKeyValue(a, 'eventScheduleMetadata', isEventScheduleMetadata) &&
  hasKeyValue(
    a,
    'answers',
    (e: unknown): e is readonly Answer[] => Arr.isArray(e) && e.every(isAnswer),
  ) &&
  hasKeyValue(a, 'answersMetadata', isAnswersMetadata);

const d = eventListItemDefaultValue;

const fillEventScheduleMetadata = (
  a: unknown,
): EventListItem['eventScheduleMetadata'] =>
  !isRecord(a)
    ? d.eventScheduleMetadata
    : ({
        id: hasKeyValue(a, 'id', isString) ? a.id : d.eventScheduleMetadata.id,

        createdAt: hasKeyValue(a, 'createdAt', isString)
          ? a.createdAt
          : d.eventScheduleMetadata.createdAt,

        updatedAt: hasKeyValue(a, 'updatedAt', isString)
          ? a.updatedAt
          : d.eventScheduleMetadata.updatedAt,
      } as const);

const fillAnswersMetadata = (a: unknown): EventListItem['answersMetadata'] =>
  !isRecord(a)
    ? d.answersMetadata
    : ({
        lastUpdate: hasKeyValue(a, 'lastUpdate', isString)
          ? a.lastUpdate
          : d.answersMetadata.lastUpdate,
      } as const);

export const fillEventListItem = (a?: unknown): EventListItem =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        eventSchedule: hasKey(a, 'eventSchedule')
          ? fillEventSchedule(a.eventSchedule)
          : d.eventSchedule,

        eventScheduleMetadata: hasKey(a, 'eventScheduleMetadata')
          ? fillEventScheduleMetadata(a.eventScheduleMetadata)
          : d.eventScheduleMetadata,

        answers:
          hasKey(a, 'answers') && Arr.isArray(a.answers)
            ? a.answers.map(fillAnswer)
            : d.answers,

        answersMetadata: hasKey(a, 'answersMetadata')
          ? fillAnswersMetadata(a.answersMetadata)
          : d.answersMetadata,
      } as const);
