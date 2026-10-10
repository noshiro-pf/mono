import { DateUtils, type Ymdhm } from 'ts-fortress-types';
import type { MinutesEnum } from 'ts-type-forge';
import { now } from '../utils/index.mjs';

const ymdhm2DateObject = (ymdhm: Ymdhm): Date =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes,
  );

export const deadlinePassed = (
  answerDeadlineYmdhm: Ymdhm,
  minutes: MinutesEnum,
): boolean => {
  const answerDeadlineDate = ymdhm2DateObject(answerDeadlineYmdhm);

  const current = ymdhm2DateObject(now());

  const msecDiff: number = current.getTime() - answerDeadlineDate.getTime();

  return 0 <= msecDiff && msecDiff <= minutes * 60 * 1000;
};
