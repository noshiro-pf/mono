import {
  fillNotificationSettings,
  isNotificationSettings,
  notificationSettingsDefaultValue,
} from './notification-settings.mjs';

describe('isNotificationSettings', () => {
  test('defaultValue should be true', () => {
    expect(isNotificationSettings(notificationSettingsDefaultValue)).toBe(true);
  });
});

describe('fillUser', () => {
  test('defaultValue should be true', () => {
    expect(fillNotificationSettings({})).toStrictEqual(
      notificationSettingsDefaultValue,
    );
  });
});
