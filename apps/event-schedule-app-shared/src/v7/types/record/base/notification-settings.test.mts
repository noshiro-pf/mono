import { expectType } from 'ts-data-forge';
import {
  fillNotificationSettings,
  isNotificationSettings,
  notificationSettingsDefaultValue,
  type NotificationSettings,
} from './notification-settings.mjs';

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
    } as const;

    assert.deepStrictEqual(notificationSettingsDefaultValue, defaultValue);
  });

  describe('isNotificationSettings', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isNotificationSettings(notificationSettingsDefaultValue));
    });
  });

  describe('fillUser', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(
        fillNotificationSettings({}),
        notificationSettingsDefaultValue,
      );
    });
  });
});
