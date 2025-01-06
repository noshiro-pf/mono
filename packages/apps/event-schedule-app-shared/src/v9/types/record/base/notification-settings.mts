import * as t from '@noshiro/io-ts';

export const NotificationSettings = t.record({
  notifyOnAnswerChange: t.boolean(false),
  notifyAfterAnswerDeadline: t.boolean(false),
  notify00daysBeforeAnswerDeadline: t.boolean(false),
  notify01daysBeforeAnswerDeadline: t.boolean(false),
  notify03daysBeforeAnswerDeadline: t.boolean(false),
  notify07daysBeforeAnswerDeadline: t.boolean(false),
  notify14daysBeforeAnswerDeadline: t.boolean(false),
  notify28daysBeforeAnswerDeadline: t.boolean(false),
});

export const isKeyofNotificationSettings = t.keyof(NotificationSettings).is;

export type NotificationSettings = t.TypeOf<typeof NotificationSettings>;
