import { type EventScheduleValidation } from './event-schedule-validation';
import { type NotificationSettingsWithEmail } from './notification-with-email';

export type EventScheduleSettingCommonState = Readonly<{
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: readonly DatetimeRange[];
  useAnswerDeadline: boolean;
  answerDeadline: Ymdhm | undefined;
  answerIcons: AnswerIconSettings;
  useNotification: boolean;
  notificationSettingsWithEmail: NotificationSettingsWithEmail | undefined;
  eventScheduleValidation: EventScheduleValidation;
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
  setNotificationSettingsWithEmail: (
    value: NotificationSettingsWithEmail,
  ) => void;
  resetNotificationSettingsSection: () => void;
  turnOffNotificationSection: () => void;
  turnOnNotificationSection: () => void;
}>;
