import { notificationSettingsWithEmailDefaultValue } from '../constants/index.mjs';
import {
  notificationEmailOf,
  notificationEmailToSave,
} from './notification-email-of.mjs';

describe(notificationEmailOf, () => {
  test('is the email of a signed-in account once it is verified', () => {
    assert.strictEqual(
      notificationEmailOf({ email: 'bob@example.com', emailVerified: true }),
      'bob@example.com',
    );
  });

  test('is undefined for an email not verified yet', () => {
    assert.isUndefined(
      notificationEmailOf({ email: 'bob@example.com', emailVerified: false }),
    );
  });

  test('is undefined for an account with no email, and when signed out', () => {
    assert.isUndefined(
      notificationEmailOf({ email: null, emailVerified: true }),
    );

    assert.isUndefined(notificationEmailOf(undefined));
  });
});

describe(notificationEmailToSave, () => {
  test('is the account’s verified email while notifications are on', () => {
    assert.strictEqual(
      notificationEmailToSave({
        notificationSettingsWithEmail: {
          ...notificationSettingsWithEmailDefaultValue,
          email: 'typed@example.com',
        },
        notificationEmail: 'bob@example.com',
      }),
      'bob@example.com',
    );
  });

  test('is empty while notifications are on and there is no verified email', () => {
    assert.strictEqual(
      notificationEmailToSave({
        notificationSettingsWithEmail: {
          ...notificationSettingsWithEmailDefaultValue,
          email: 'typed@example.com',
        },
        notificationEmail: undefined,
      }),
      '',
    );
  });

  test('is undefined while notifications are off', () => {
    assert.isUndefined(
      notificationEmailToSave({
        notificationSettingsWithEmail: undefined,
        notificationEmail: 'bob@example.com',
      }),
    );
  });
});
