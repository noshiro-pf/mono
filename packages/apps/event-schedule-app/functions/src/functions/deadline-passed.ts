import { type Ymdhm } from '@noshiro/event-schedule-app-shared';
import { DateUtils, SafeInt } from '@noshiro/ts-utils';
import { now } from '../utils';

const ymdhm2DateObject = (ymdhm: Ymdhm): DateUtils =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes
  );

export const deadlinePassed = (
  answerDeadlineYmdhm: Ymdhm,
  minutes: MinutesEnum
): boolean => {
  const answerDeadlineDate = ymdhm2DateObject(answerDeadlineYmdhm);
  const current = ymdhm2DateObject(now());
  const msecDiff: SafeInt = SafeInt.sub(
    current.getTime(),
    answerDeadlineDate.getTime()
  );

  return 0 <= msecDiff && msecDiff <= minutes * 60 * 1000;
};