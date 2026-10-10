import { Answer, EventSchedule } from 'event-schedule-app-shared';
import { type DocumentData } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { fastDeepEqual, isString, unknownToString } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

export const toStringWithCheck = (value: unknown): string => {
  if (isString(value)) {
    return value;
  }

  logger.warn(`typeof value should be string but was ${typeof value}`);

  return unknownToString(value);
};

export const fillAnswerWithCheck = (
  value: DeepReadonly<DocumentData>,
): Answer => {
  const filled = Answer.fill(value);

  if (!fastDeepEqual(filled, value)) {
    logger.warn('There is a difference with the result of fillAnswer');
  }

  return filled;
};

export const fillEventScheduleWithCheck = (
  value: DeepReadonly<DocumentData>,
): EventSchedule => {
  const filled = EventSchedule.fill(value);

  if (!fastDeepEqual(filled, value)) {
    logger.warn('There is a difference with the result of fillEventSchedule');
  }

  return filled;
};
