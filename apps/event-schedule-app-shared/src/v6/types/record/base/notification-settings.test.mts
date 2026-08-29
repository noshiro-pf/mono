import {
  fillNotificationSettings,
  isNotificationSettings,
  notificationSettingsDefaultValue,
} from './notification-settings.mjs';

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
