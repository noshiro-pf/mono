import { isEmailString } from '@noshiro/ts-utils-additional';
import { answerIconPointConfig } from '../../constants';
import type { EventScheduleValidation } from '../../types';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  answerIcons,
  notificationSettings,
}: Readonly<{
  datetimeRangeList: readonly DatetimeRange[]; // allow an empty array
}> &
  StrictOmit<
    EventSchedule,
    | 'answerDeadline'
    | 'archivedBy'
    | 'author'
    | 'datetimeRangeList'
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
    Num.isInRange(
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