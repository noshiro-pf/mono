import { NotificationSettings } from 'event-schedule-app-shared';
import { type NotificationSettingsWithEmail } from '../types/index.mjs';

export const notificationSettingsWithEmailDefaultValue: NotificationSettingsWithEmail =
  { ...NotificationSettings.defaultValue, email: '' } as const;
