import { ifthen, isEmailString, StrictOmit } from '@noshiro/ts-utils';
import { EventScheduleBaseType } from '../../../types/record/event-schedule';
import { EventScheduleValidation } from '../../../types/record/event-schedule-validation';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  useAnswerDeadline,
  answerDeadline,
  answerSymbolList,
  useNotification,
  notificationSettings,
}: Readonly<{
  answerDeadline: EventScheduleBaseType['answerDeadline'] | undefined;
}> &
  StrictOmit<
    EventScheduleBaseType,
    | 'answerDeadline'
    | 'customizeSymbolSettings'
    | 'datetimeSpecification'
    | 'notes'
    | 'timezoneOffsetMinutes'
  >): EventScheduleValidation => ({
  title: title !== '',
  datetimeRangeList: !datetimeRangeList.isEmpty(),
  answerDeadline: ifthen(useAnswerDeadline, answerDeadline !== undefined),
  answerSymbolList: answerSymbolList.size >= 2,
  notificationEmail: ifthen(
    useNotification,
    isEmailString(notificationSettings.email)
  ),
  notificationItems: ifthen(
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
