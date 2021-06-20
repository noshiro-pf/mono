export type NotificationSettings = Readonly<{
  email: string;
  notifyOnAnswerChange: boolean;
  notify01daysBeforeAnswerDeadline: boolean;
  notify03daysBeforeAnswerDeadline: boolean;
  notify07daysBeforeAnswerDeadline: boolean;
  notify14daysBeforeAnswerDeadline: boolean;
  notify28daysBeforeAnswerDeadline: boolean;
}>;

export type PartialNotificationSettings = Partial<
  Readonly<NotificationSettings>
>;

export const defaultNotificationSettings: NotificationSettings = {
  email: '',
  notifyOnAnswerChange: false,
  notify01daysBeforeAnswerDeadline: false,
  notify03daysBeforeAnswerDeadline: false,
  notify07daysBeforeAnswerDeadline: false,
  notify14daysBeforeAnswerDeadline: false,
  notify28daysBeforeAnswerDeadline: false,
} as const;

const d = defaultNotificationSettings;
export const fillNotificationSettings = (
  a?: PartialNotificationSettings
): NotificationSettings => ({
  email: a?.email ?? d.email,
  notifyOnAnswerChange: a?.notifyOnAnswerChange ?? d.notifyOnAnswerChange,
  notify01daysBeforeAnswerDeadline:
    a?.notify01daysBeforeAnswerDeadline ?? d.notify01daysBeforeAnswerDeadline,
  notify03daysBeforeAnswerDeadline:
    a?.notify03daysBeforeAnswerDeadline ?? d.notify03daysBeforeAnswerDeadline,
  notify07daysBeforeAnswerDeadline:
    a?.notify07daysBeforeAnswerDeadline ?? d.notify07daysBeforeAnswerDeadline,
  notify14daysBeforeAnswerDeadline:
    a?.notify14daysBeforeAnswerDeadline ?? d.notify14daysBeforeAnswerDeadline,
  notify28daysBeforeAnswerDeadline:
    a?.notify28daysBeforeAnswerDeadline ?? d.notify28daysBeforeAnswerDeadline,
});
