import type {
  EventSchedule,
  EventScheduleValidation,
} from '@noshiro/event-schedule-app-shared';
import { ifThen, IList, isEmailString, isInRange } from '@noshiro/ts-utils';
import { answerSymbolPointConfig } from '../../constants';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  useAnswerDeadline,
  answerSymbols,
  answerDeadline,
  useNotification,
  notificationSettings,
}: Readonly<{
  answerDeadline: EventSchedule['answerDeadline'] | undefined;
}> &
  StrictOmit<
    EventSchedule,
    | 'answerDeadline'
    | 'datetimeSpecification'
    | 'notes'
    | 'timezoneOffsetMinutes'
  >): EventScheduleValidation => ({
  title: title !== '',
  datetimeRangeList: !IList.isEmpty(datetimeRangeList),
  answerDeadline: ifThen(useAnswerDeadline, answerDeadline !== undefined),
  answerSymbols:
    answerSymbols.good.description === '' ||
    answerSymbols.fair.description === '' ||
    answerSymbols.poor.description === '' ||
    isInRange(
      answerSymbolPointConfig.fair.min,
      answerSymbolPointConfig.fair.max
    )(answerSymbols.fair.point),
  notificationEmail: ifThen(
    useNotification,
    isEmailString(notificationSettings.email)
  ),
  notificationItems: ifThen(
    useNotification,
    notificationSettings.notifyOnAnswerChange ||
      notificationSettings.notify01daysBeforeAnswerDeadline ||
      notificationSettings.notify03daysBeforeAnswerDeadline ||
      notificationSettings.notify07daysBeforeAnswerDeadline ||
      notificationSettings.notify14daysBeforeAnswerDeadline ||
      notificationSettings.notify28daysBeforeAnswerDeadline
  ),
});

export const validateEventScheduleAll = (
  eventScheduleValidation: EventScheduleValidation
): boolean =>
  eventScheduleValidation.title &&
  eventScheduleValidation.datetimeRangeList &&
  eventScheduleValidation.answerDeadline &&
  eventScheduleValidation.answerSymbols &&
  eventScheduleValidation.notificationEmail &&
  eventScheduleValidation.notificationItems;
