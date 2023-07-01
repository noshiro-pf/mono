import * as t from '@noshiro/io-ts';

export const notificationSettingsTypeDef = t.record({
  notifyOnAnswerChange: t.boolean(false),
  notify00daysBeforeAnswerDeadline: t.boolean(false),
  notify01daysBeforeAnswerDeadline: t.boolean(false),
  notify03daysBeforeAnswerDeadline: t.boolean(false),
  notify07daysBeforeAnswerDeadline: t.boolean(false),
  notify14daysBeforeAnswerDeadline: t.boolean(false),
  notify28daysBeforeAnswerDeadline: t.boolean(false),
});

export type NotificationSettings = t.TypeOf<typeof notificationSettingsTypeDef>;

export const notificationSettingsDefaultValue =
  notificationSettingsTypeDef.defaultValue;

export const isNotificationSettings = notificationSettingsTypeDef.is;

export const fillNotificationSettings = notificationSettingsTypeDef.fill;
