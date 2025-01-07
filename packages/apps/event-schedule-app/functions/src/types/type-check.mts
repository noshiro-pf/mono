import { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { Str, isString } from '@noshiro/ts-utils';
import { logger } from 'firebase-functions';

export const toStringWithCheck = (value: unknown): string => {
  if (isString(value)) return value;
  logger.warn(`typeof value should be string but was ${typeof value}`);
  return Str.from(value);
};

export const fillAnswerWithCheck = (
  value: DeepReadonly<FirebaseFirestore.DocumentData>,
): Answer => {
  const filled = Answer.fill(value);
  if (!deepEqual(filled, value)) {
    logger.warn(`There is a difference with the result of fillAnswer`);
  }
  return filled;
};

export const fillEventScheduleWithCheck = (
  value: DeepReadonly<FirebaseFirestore.DocumentData>,
): EventSchedule => {
  const filled = EventSchedule.fill(value);
  if (!deepEqual(filled, value)) {
    logger.warn(`There is a difference with the result of fillEventSchedule`);
  }
  return filled;
};
