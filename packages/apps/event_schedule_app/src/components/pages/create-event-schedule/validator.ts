import type {
  EventSchedule,
  EventScheduleValidation,
} from '@noshiro/event-schedule-app-api';
import type { StrictOmit } from '@noshiro/ts-utils';
import { ifThen, isEmailString, isEmpty } from '@noshiro/ts-utils';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  useAnswerDeadline,
  answerDeadline,
  answerSymbolList,
  useNotification,
  notificationSettings,
}: Readonly<{
  answerDeadline: EventSchedule['answerDeadline'] | undefined;
}> &
  StrictOmit<
    EventSchedule,
    | 'answerDeadline'
    | 'customizeSymbolSettings'
    | 'datetimeSpecification'
    | 'notes'
    | 'timezoneOffsetMinutes'
  >): EventScheduleValidation => ({
  title: title !== '',
  datetimeRangeList: !isEmpty(datetimeRangeList),
  answerDeadline: ifThen(useAnswerDeadline, answerDeadline !== undefined),
  answerSymbolList: answerSymbolList.length >= 2,
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
  eventScheduleValidation.answerSymbolList &&
  eventScheduleValidation.notificationEmail &&
  eventScheduleValidation.notificationItems;
