import { assertType } from '@noshiro/ts-utils';
import type { NotificationSettings } from './notification-settings';
import {
  fillNotificationSettings,
  isNotificationSettings,
  notificationSettingsDefaultValue,
} from './notification-settings';

describe('NotificationSettings', () => {
  assertType<
    TypeEq<
      NotificationSettings,
      Readonly<{
        notifyOnAnswerChange: boolean;
        notify01daysBeforeAnswerDeadline: boolean;
        notify03daysBeforeAnswerDeadline: boolean;
        notify07daysBeforeAnswerDeadline: boolean;
        notify14daysBeforeAnswerDeadline: boolean;
        notify28daysBeforeAnswerDeadline: boolean;
      }>
    >
  >();

  test('defaultValue', () => {
    const defaultValue: NotificationSettings = {
      notifyOnAnswerChange: false,
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