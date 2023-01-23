import { isEmailString } from '@noshiro/ts-utils-additional';
import { answerIconPointConfig } from '../../constants';
import {
  type EventScheduleValidation,
  type NotificationSettingsWithEmail,
} from '../../types';

export const validateEventSchedule = ({
  title,
  datetimeRangeList,
  answerIcons,
  notificationSettingsWithEmail,
}: Readonly<{
  datetimeRangeList: readonly DatetimeRange[]; // allow an empty array
  notificationSettingsWithEmail: NotificationSettingsWithEmail | 'none';
}> &
  StrictOmit<
    EventSchedule,
    | 'answerDeadline'
    | 'archivedBy'
    | 'author'
    | 'datetimeRangeList'
    | 'datetimeSpecification'
    | 'notes'
    | 'notificationSettings'
    | 'timezoneOffsetMinutes'
  >): EventScheduleValidation => ({
  title: title !== '',
  datetimeRangeList: !Arr.isEmpty(datetimeRangeList),
  answerIcons:
    answerIcons.good.description === '' ||
    answerIcons.fair.description === '' ||
    answerIcons.poor.description === '' ||
    Num.isInRange(
      answerIconPointConfig.fair.min,
      answerIconPointConfig.fair.max
    )(answerIcons.fair.point),
  notificationEmail:
    notificationSettingsWithEmail === 'none' ||
    isEmailString(notificationSettingsWithEmail.email),
  notificationItems:
    notificationSettingsWithEmail === 'none' ||
    notificationSettingsWithEmail.notifyOnAnswerChange ||
    notificationSettingsWithEmail.notify01daysBeforeAnswerDeadline ||
    notificationSettingsWithEmail.notify03daysBeforeAnswerDeadline ||
    notificationSettingsWithEmail.notify07daysBeforeAnswerDeadline ||
    notificationSettingsWithEmail.notify14daysBeforeAnswerDeadline ||
    notificationSettingsWithEmail.notify28daysBeforeAnswerDeadline,
});

export const validateEventScheduleAll = (
  eventScheduleValidation: EventScheduleValidation
): boolean =>
  eventScheduleValidation.title &&
  eventScheduleValidation.datetimeRangeList &&
  eventScheduleValidation.answerIcons &&
  eventScheduleValidation.notificationEmail &&
  eventScheduleValidation.notificationItems;
