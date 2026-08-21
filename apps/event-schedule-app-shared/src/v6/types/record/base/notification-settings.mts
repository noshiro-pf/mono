import { isBoolean, isRecord, isString } from 'ts-data-forge';
import { hasKeyValue } from '../../../../utils/index.mjs';

export type NotificationSettings = Readonly<{
  email: string;
  notifyOnAnswerChange: boolean;
  notify01daysBeforeAnswerDeadline: boolean;
  notify03daysBeforeAnswerDeadline: boolean;
  notify07daysBeforeAnswerDeadline: boolean;
  notify14daysBeforeAnswerDeadline: boolean;
  notify28daysBeforeAnswerDeadline: boolean;
}>;

export const notificationSettingsDefaultValue = {
  email: '',
  notifyOnAnswerChange: false,
  notify01daysBeforeAnswerDeadline: false,
  notify03daysBeforeAnswerDeadline: false,
  notify07daysBeforeAnswerDeadline: false,
  notify14daysBeforeAnswerDeadline: false,
  notify28daysBeforeAnswerDeadline: false,
} as const satisfies NotificationSettings;

export const isNotificationSettings = (a: unknown): a is NotificationSettings =>
  isRecord(a) &&
  hasKeyValue(a, 'email', isString) &&
  hasKeyValue(a, 'notifyOnAnswerChange', isBoolean) &&
  hasKeyValue(a, 'notify01daysBeforeAnswerDeadline', isBoolean) &&
  hasKeyValue(a, 'notify03daysBeforeAnswerDeadline', isBoolean) &&
  hasKeyValue(a, 'notify07daysBeforeAnswerDeadline', isBoolean) &&
  hasKeyValue(a, 'notify14daysBeforeAnswerDeadline', isBoolean) &&
  hasKeyValue(a, 'notify28daysBeforeAnswerDeadline', isBoolean);

const d = notificationSettingsDefaultValue;

export const fillNotificationSettings = (a?: unknown): NotificationSettings =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        email: hasKeyValue(a, 'email', isString) ? a.email : d.email,
        notifyOnAnswerChange: hasKeyValue(a, 'notifyOnAnswerChange', isBoolean)
          ? a.notifyOnAnswerChange
          : d.notifyOnAnswerChange,
        notify01daysBeforeAnswerDeadline: hasKeyValue(
          a,
          'notify01daysBeforeAnswerDeadline',
          isBoolean,
        )
          ? a.notify01daysBeforeAnswerDeadline
          : d.notify01daysBeforeAnswerDeadline,
        notify03daysBeforeAnswerDeadline: hasKeyValue(
          a,
          'notify03daysBeforeAnswerDeadline',
          isBoolean,
        )
          ? a.notify03daysBeforeAnswerDeadline
          : d.notify03daysBeforeAnswerDeadline,
        notify07daysBeforeAnswerDeadline: hasKeyValue(
          a,
          'notify07daysBeforeAnswerDeadline',
          isBoolean,
        )
          ? a.notify07daysBeforeAnswerDeadline
          : d.notify07daysBeforeAnswerDeadline,
        notify14daysBeforeAnswerDeadline: hasKeyValue(
          a,
          'notify14daysBeforeAnswerDeadline',
          isBoolean,
        )
          ? a.notify14daysBeforeAnswerDeadline
          : d.notify14daysBeforeAnswerDeadline,
        notify28daysBeforeAnswerDeadline: hasKeyValue(
          a,
          'notify28daysBeforeAnswerDeadline',
          isBoolean,
        )
          ? a.notify28daysBeforeAnswerDeadline
          : d.notify28daysBeforeAnswerDeadline,
      } as const);
