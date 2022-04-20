import type { EventScheduleValidation } from './event-schedule-validation';

export type EventScheduleSettingCommonState = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: readonly DatetimeRange[];
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  answerIcons: AnswerIconSettings;
  useNotification: boolean;
  notificationSettings: NotificationSettings | undefined;
  eventScheduleValidation: EventScheduleValidation;
  hasNoChanges: boolean;
  eventScheduleNormalized: EventSchedule;
  eventScheduleValidationOk: boolean;
}>;

export type EventScheduleSettingCommonStateHandler = Readonly<{
  setTitle: (value: string) => void;
  resetTitle: () => void;

  setNotes: (value: string) => void;
  resetNotes: () => void;

  setDatetimeSpecification: (value: DatetimeSpecificationEnumType) => void;
  resetDatetimeSpecification: () => void;

  setDatetimeRangeList: (list: readonly DatetimeRange[]) => void;
  resetDatetimeRangeList: () => void;

  toggleAnswerDeadlineSection: () => void;
  setAnswerDeadline: (value: Ymdhm | undefined) => void;
  resetAnswerDeadlineSection: () => void;
  turnOffAnswerDeadlineSection: () => void;
  turnOnAnswerDeadlineSection: () => void;

  setAnswerIcons: (value: AnswerIconSettings) => void;
  resetAnswerIcons: () => void;

  toggleNotificationSection: () => void;
  setNotificationSettings: (value: NotificationSettings) => void;
  resetNotificationSettingsSection: () => void;
  turnOffNotificationSection: () => void;
  turnOnNotificationSection: () => void;
}>;
