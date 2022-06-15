import { IList, IRecord, isRecord, isString } from '@noshiro/ts-utils';
import type { Answer } from '../../v6';
import { fillAnswer, isAnswer } from '../../v6';
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
  IRecord.hasKeyValue(a, 'id', isString) &&
  IRecord.hasKeyValue(a, 'createdAt', isString) &&
  IRecord.hasKeyValue(a, 'updatedAt', isString);

const isAnswersMetadata = (a: unknown): a is EventListItem['answersMetadata'] =>
  isRecord(a) && IRecord.hasKeyValue(a, 'lastUpdate', isString);

export const isEventListItem = (a: unknown): a is EventListItem =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'eventSchedule', isEventSchedule) &&
  IRecord.hasKeyValue(a, 'eventScheduleMetadata', isEventScheduleMetadata) &&
  IRecord.hasKeyValue(
    a,
    'answers',
    (e: unknown): e is Answer[] => IList.isArray(e) && e.every(isAnswer)
  ) &&
  IRecord.hasKeyValue(a, 'answersMetadata', isAnswersMetadata);

const d = eventListItemDefaultValue;

const fillEventScheduleMetadata = (
  a: unknown
): EventListItem['eventScheduleMetadata'] =>
  !isRecord(a)
    ? d.eventScheduleMetadata
    : {
        id: IRecord.hasKeyValue(a, 'id', isString)
          ? a.id
          : d.eventScheduleMetadata.id,

        createdAt: IRecord.hasKeyValue(a, 'createdAt', isString)
          ? a.createdAt
          : d.eventScheduleMetadata.createdAt,

        updatedAt: IRecord.hasKeyValue(a, 'updatedAt', isString)
          ? a.updatedAt
          : d.eventScheduleMetadata.updatedAt,
      };

const fillAnswersMetadata = (a: unknown): EventListItem['answersMetadata'] =>
  !isRecord(a)
    ? d.answersMetadata
    : {
        lastUpdate: IRecord.hasKeyValue(a, 'lastUpdate', isString)
          ? a.lastUpdate
          : d.answersMetadata.lastUpdate,
      };

export const fillEventListItem = (a?: unknown): EventListItem =>
  a === undefined || !isRecord(a)
    ? d
    : {
        eventSchedule: IRecord.hasKey(a, 'eventSchedule')
          ? fillEventSchedule(a.eventSchedule)
          : d.eventSchedule,

        eventScheduleMetadata: IRecord.hasKey(a, 'eventScheduleMetadata')
          ? fillEventScheduleMetadata(a.eventScheduleMetadata)
          : d.eventScheduleMetadata,

        answers: IRecord.hasKey(a, 'answers')
          ? IList.isArray(a.answers)
            ? a.answers.map(fillAnswer)
            : d.answers
          : d.answers,

        answersMetadata: IRecord.hasKey(a, 'answersMetadata')
          ? fillAnswersMetadata(a.answersMetadata)
          : d.answersMetadata,
      };
