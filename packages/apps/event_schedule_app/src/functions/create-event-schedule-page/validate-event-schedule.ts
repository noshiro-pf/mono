import type {
  EventSchedule,
  EventScheduleValidation,
} from '@noshiro/event-schedule-app-shared';
import { ifThen, IList, isEmailString, isInRange } from '@noshiro/ts-utils';
import { answerIconPointConfig } from '../../constants';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  useAnswerDeadline,
  answerIcons,
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
  answerIcons:
    answerIcons.good.description === '' ||
    answerIcons.fair.description === '' ||
    answerIcons.poor.description === '' ||
    isInRange(
      answerIconPointConfig.fair.min,
      answerIconPointConfig.fair.max
    )(answerIcons.fair.point),
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
  eventScheduleValidation.answerIcons &&
  eventScheduleValidation.notificationEmail &&
  eventScheduleValidation.notificationItems;
