import { isBoolean, isRecord, isString, Obj } from '@noshiro/ts-utils';

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
  Obj.hasKeyValue(a, 'email', isString) &&
  Obj.hasKeyValue(a, 'notifyOnAnswerChange', isBoolean) &&
  Obj.hasKeyValue(a, 'notify01daysBeforeAnswerDeadline', isBoolean) &&
  Obj.hasKeyValue(a, 'notify03daysBeforeAnswerDeadline', isBoolean) &&
  Obj.hasKeyValue(a, 'notify07daysBeforeAnswerDeadline', isBoolean) &&
  Obj.hasKeyValue(a, 'notify14daysBeforeAnswerDeadline', isBoolean) &&
  Obj.hasKeyValue(a, 'notify28daysBeforeAnswerDeadline', isBoolean);

const d = notificationSettingsDefaultValue;

export const fillNotificationSettings = (a?: unknown): NotificationSettings =>
  a === undefined || !isRecord(a)
    ? d
    : {
        email: Obj.hasKeyValue(a, 'email', isString) ? a.email : d.email,
        notifyOnAnswerChange: Obj.hasKeyValue(
          a,
          'notifyOnAnswerChange',
          isBoolean
        )
          ? a.notifyOnAnswerChange
          : d.notifyOnAnswerChange,
        notify01daysBeforeAnswerDeadline: Obj.hasKeyValue(
          a,
          'notify01daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify01daysBeforeAnswerDeadline
          : d.notify01daysBeforeAnswerDeadline,
        notify03daysBeforeAnswerDeadline: Obj.hasKeyValue(
          a,
          'notify03daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify03daysBeforeAnswerDeadline
          : d.notify03daysBeforeAnswerDeadline,
        notify07daysBeforeAnswerDeadline: Obj.hasKeyValue(
          a,
          'notify07daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify07daysBeforeAnswerDeadline
          : d.notify07daysBeforeAnswerDeadline,
        notify14daysBeforeAnswerDeadline: Obj.hasKeyValue(
          a,
          'notify14daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify14daysBeforeAnswerDeadline
          : d.notify14daysBeforeAnswerDeadline,
        notify28daysBeforeAnswerDeadline: Obj.hasKeyValue(
          a,
          'notify28daysBeforeAnswerDeadline',
          isBoolean
        )
          ? a.notify28daysBeforeAnswerDeadline
          : d.notify28daysBeforeAnswerDeadline,
      };
