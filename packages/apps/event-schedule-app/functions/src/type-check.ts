import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import {
  fillAnswer,
  fillEventSchedule,
} from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { IRecord, isRecord, Json, Result, Str } from '@noshiro/ts-utils';
import { logger } from 'firebase-functions';

export const toStringWithCheck = (value: unknown): string => {
  if (typeof value === 'string') return value;
  logger.error(`typeof value should be string but was ${typeof value}`);
  return Str.from(value);
};

export const fillAnswerWithCheck = (
  value: DeepReadonly<FirebaseFirestore.DocumentData>
): Answer => {
  const filled = fillAnswer(value);
  if (!deepEqual(filled, value)) {
    logger.error(`There is a difference with the result of fillAnswer`);
  }
  return filled;
};

export const fillEventScheduleWithCheck = (
  value: DeepReadonly<FirebaseFirestore.DocumentData>
): EventSchedule => {
  const filled = fillEventSchedule(value);
  if (!deepEqual(filled, value)) {
    logger.error(`There is a difference with the result of fillEventSchedule`);
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
  isRecord(config) &&
  IRecord.hasKey(config, 'gmail') &&
  isRecord(config.gmail) &&
  IRecord.hasKeyValue(
    config.gmail,
    'email',
    (v): v is string => typeof v === 'string'
  ) &&
  IRecord.hasKeyValue(
    config.gmail,
    'password',
    (v): v is string => typeof v === 'string'
  );

export const fillGmailConfig = (
  config: ReadonlyJSONValue
): DeepReadonly<{
  gmail: {
    email: string;
    password: string;
  };
}> => {
  if (!isGmailConfig(config)) {
    logger.error(
      `${Result.unwrapThrow(Json.stringify(config))} is not GmailConfig`
    );
    return { gmail: { email: '', password: '' } };
  }
  return config;
};
