import { IRecord, isBoolean, isRecord, isString } from '@noshiro/ts-utils';

export type NotificationSettings = Readonly<{
  email: string;
  notifyOnAnswerChange: boolean;
  notify01daysBeforeAnswerDeadline: boolean;
  notify03daysBeforeAnswerDeadline: boolean;
  notify07daysBeforeAnswerDeadline: boolean;
  notify14daysBeforeAnswerDeadline: boolean;
  notify28daysBeforeAnswerDeadline: boolean;
}>;

export const notificationSettingsDefaultValue: NotificationSettings = {
  email: '',
  notifyOnAnswerChange: false,
  notify01daysBeforeAnswerDeadline: false,
  notify03daysBeforeAnswerDeadline: false,
  notify07daysBeforeAnswerDeadline: false,
  notify14daysBeforeAnswerDeadline: false,
  notify28daysBeforeAnswerDeadline: false,
} as const;

export const isNotificationSettings = (a: unknown): a is NotificationSettings =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'email', isString) &&
  IRecord.hasKeyValue(a, 'notifyOnAnswerChange', isBoolean) &&
  IRecord.hasKeyValue(a, 'notify01daysBeforeAnswerDeadline', isBoolean) &&
  IRecord.hasKeyValue(a, 'notify03daysBeforeAnswerDeadline', isBoolean) &&
  IRecord.hasKeyValue(a, 'notify07daysBeforeAnswerDeadline', isBoolean) &&
  IRecord.hasKeyValue(a, 'notify14daysBeforeAnswerDeadline', isBoolean) &&
  IRecord.hasKeyValue(a, 'notify28daysBeforeAnswerDeadline', isBoolean);

const d = notificationSettingsDefaultValue;

export const fillNotificationSettings = (a?: unknown): NotificationSettings =>
  a === undefined || !isRecord(a)
    ? d
    : {
        email: IRecord.hasKeyValue(a, 'email', isString) ? a.email : d.email,
        notifyOnAnswerChange: IRecord.hasKeyValue(
          a,
          'notifyOnAnswerChange',
          isBoolean
        )
          ? a.notifyOnAnswerChange
          : d.notifyOnAnswerChange,
        notify01daysBeforeAnswerDeadline: IRecord.hasKeyValue(
          a,
          'notify01daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify01daysBeforeAnswerDeadline
          : d.notify01daysBeforeAnswerDeadline,
        notify03daysBeforeAnswerDeadline: IRecord.hasKeyValue(
          a,
          'notify03daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify03daysBeforeAnswerDeadline
          : d.notify03daysBeforeAnswerDeadline,
        notify07daysBeforeAnswerDeadline: IRecord.hasKeyValue(
          a,
          'notify07daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify07daysBeforeAnswerDeadline
          : d.notify07daysBeforeAnswerDeadline,
        notify14daysBeforeAnswerDeadline: IRecord.hasKeyValue(
          a,
          'notify14daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify14daysBeforeAnswerDeadline
          : d.notify14daysBeforeAnswerDeadline,
        notify28daysBeforeAnswerDeadline: IRecord.hasKeyValue(
          a,
          'notify28daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify28daysBeforeAnswerDeadline
          : d.notify28daysBeforeAnswerDeadline,
      };
