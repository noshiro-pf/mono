import { NotificationSettings } from '@noshiro/event-schedule-app-shared';
import { type NotificationSettingsWithEmail } from '../types';

export const notificationSettingsWithEmailDefaultValue: NotificationSettingsWithEmail =
  {
    ...NotificationSettings.defaultValue,
    email: '',
  };
