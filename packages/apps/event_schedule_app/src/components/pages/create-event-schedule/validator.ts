import type { StrictOmit } from '@noshiro/ts-utils';
import { ifThen, isEmailString } from '@noshiro/ts-utils';
import type {
  EventScheduleBaseType,
  EventScheduleValidation,
} from '../../../types';

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
  answerDeadline: ifThen(useAnswerDeadline, answerDeadline !== undefined),
  answerSymbolList: answerSymbolList.size >= 2,
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
