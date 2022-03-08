import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { IList, isEmailString, isInRange } from '@noshiro/ts-utils';
import { answerIconPointConfig } from '../../constants';
import type { EventScheduleValidation } from '../../types';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  answerIcons,
  notificationSettings,
}: StrictOmit<
  EventSchedule,
  | 'answerDeadline'
  | 'author'
  | 'datetimeSpecification'
  | 'notes'
  | 'timezoneOffsetMinutes'
>): EventScheduleValidation => ({
  title: title !== '',
  datetimeRangeList: !IList.isEmpty(datetimeRangeList),
  answerIcons:
    answerIcons.good.description === '' ||
    answerIcons.fair.description === '' ||
    answerIcons.poor.description === '' ||
    isInRange(
      answerIconPointConfig.fair.min,
      answerIconPointConfig.fair.max
    )(answerIcons.fair.point),
  notificationEmail:
    notificationSettings === 'none' ||
    isEmailString(notificationSettings.email),
  notificationItems:
    notificationSettings === 'none' ||
    notificationSettings.notifyOnAnswerChange ||
    notificationSettings.notify01daysBeforeAnswerDeadline ||
    notificationSettings.notify03daysBeforeAnswerDeadline ||
    notificationSettings.notify07daysBeforeAnswerDeadline ||
    notificationSettings.notify14daysBeforeAnswerDeadline ||
    notificationSettings.notify28daysBeforeAnswerDeadline,
});

export const validateEventScheduleAll = (
  eventScheduleValidation: EventScheduleValidation
): boolean =>
  eventScheduleValidation.title &&
  eventScheduleValidation.datetimeRangeList &&
  eventScheduleValidation.answerIcons &&
  eventScheduleValidation.notificationEmail &&
  eventScheduleValidation.notificationItems;
