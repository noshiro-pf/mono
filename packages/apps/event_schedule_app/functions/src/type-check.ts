import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import {
  fillAnswer,
  fillEventSchedule,
} from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { hasKey, hasKeyValue, isNonNullObject } from '@noshiro/ts-utils';
import * as functions from 'firebase-functions';

export const toStringWithCheck = (value: unknown): string => {
  if (typeof value === 'string') return value;
  functions.logger.error(
    `typeof value should be string but was ${typeof value}`
  );
  return String(value);
};

export const fillAnswerWithCheck = (
  value: DeepReadonly<FirebaseFirestore.DocumentData>
): Answer => {
  const filled = fillAnswer(value);
  if (!deepEqual(filled, value)) {
    functions.logger.error(
      `There is a difference with the result of fillAnswer`
    );
  }
  return filled;
};

export const fillEventScheduleWithCheck = (
  value: DeepReadonly<FirebaseFirestore.DocumentData>
): EventSchedule => {
  const filled = fillEventSchedule(value);
  if (!deepEqual(filled, value)) {
    functions.logger.error(
      `There is a difference with the result of fillEventSchedule`
    );
  }
  return filled;
};

const isGmailConfig = (
  config: unknown
): config is DeepReadonly<{
  gmail: {
    email: string;
    password: string;
  };
}> =>
  isNonNullObject(config) &&
  hasKey(config, 'gmail') &&
  isNonNullObject(config.gmail) &&
  hasKeyValue(
    config.gmail,
    'email',
    (v): v is string => typeof v === 'string'
  ) &&
  hasKeyValue(
    config.gmail,
    'password',
    (v): v is string => typeof v === 'string'
  );

export const fillGmailConfig = (
  config: unknown
): DeepReadonly<{
  gmail: {
    email: string;
    password: string;
  };
}> => {
  if (!isGmailConfig(config)) {
    functions.logger.error(`${JSON.stringify(config)} is not GmailConfig`);
    return { gmail: { email: '', password: '' } };
  }
  return config;
};
