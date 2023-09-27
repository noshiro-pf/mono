import { expectType } from '@noshiro/ts-utils';
import {
  fillNotificationSettings,
  isNotificationSettings,
  notificationSettingsDefaultValue,
  type NotificationSettings,
} from './notification-settings';

describe('NotificationSettings', () => {
  expectType<
    NotificationSettings,
    Readonly<{
      notifyOnAnswerChange: boolean;
      notifyAfterAnswerDeadline: boolean;
      notify00daysBeforeAnswerDeadline: boolean;
      notify01daysBeforeAnswerDeadline: boolean;
      notify03daysBeforeAnswerDeadline: boolean;
      notify07daysBeforeAnswerDeadline: boolean;
      notify14daysBeforeAnswerDeadline: boolean;
      notify28daysBeforeAnswerDeadline: boolean;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: NotificationSettings = {
      notifyOnAnswerChange: false,
      notifyAfterAnswerDeadline: false,
      notify00daysBeforeAnswerDeadline: false,
      notify01daysBeforeAnswerDeadline: false,
      notify03daysBeforeAnswerDeadline: false,
      notify07daysBeforeAnswerDeadline: false,
      notify14daysBeforeAnswerDeadline: false,
      notify28daysBeforeAnswerDeadline: false,
    };
    expect(notificationSettingsDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isNotificationSettings', () => {
    test('defaultValue should be true', () => {
      expect(isNotificationSettings(notificationSettingsDefaultValue)).toBe(
        true
      );
    });
  });

  describe('fillUser', () => {
    test('defaultValue should be true', () => {
      expect(fillNotificationSettings({})).toStrictEqual(
        notificationSettingsDefaultValue
      );
    });
  });
});
