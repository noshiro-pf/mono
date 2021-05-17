import { IRecord } from '../../../utils/immutable';

type NotificationSettingsBaseType = Readonly<{
  email: string;
  notifyOnAnswerChange: boolean;
  notify01daysBeforeAnswerDeadline: boolean;
  notify03daysBeforeAnswerDeadline: boolean;
  notify07daysBeforeAnswerDeadline: boolean;
  notify14daysBeforeAnswerDeadline: boolean;
  notify28daysBeforeAnswerDeadline: boolean;
}>;

export type PartialNotificationSettings = Partial<
  Readonly<NotificationSettingsBaseType>
>;

export type INotificationSettings = IRecord<NotificationSettingsBaseType> &
  Readonly<NotificationSettingsBaseType>;

const INotificationSettingsRecordFactory =
  IRecord<NotificationSettingsBaseType>({
    email: '',
    notifyOnAnswerChange: false,
    notify01daysBeforeAnswerDeadline: false,
    notify03daysBeforeAnswerDeadline: false,
    notify07daysBeforeAnswerDeadline: false,
    notify14daysBeforeAnswerDeadline: false,
    notify28daysBeforeAnswerDeadline: false,
  });

export const createINotificationSettings: (
  a?: NotificationSettingsBaseType
) => INotificationSettings = INotificationSettingsRecordFactory;

export const fillNotificationSettings: (
  a?: PartialNotificationSettings
) => INotificationSettings = INotificationSettingsRecordFactory;
