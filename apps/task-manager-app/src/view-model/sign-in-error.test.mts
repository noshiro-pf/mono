import { describeSignInError } from './sign-in-error.mjs';

describe(describeSignInError, () => {
  test('says nothing when the reader closed the popup', () => {
    assert.isUndefined(
      describeSignInError({ code: 'auth/popup-closed-by-user' }),
    );

    assert.isUndefined(
      describeSignInError({ code: 'auth/cancelled-popup-request' }),
    );
  });

  test('says what to do about a blocked popup', () => {
    assert.include(
      describeSignInError({ code: 'auth/popup-blocked' }),
      'ポップアップ',
    );
  });

  test('names a domain Firebase does not know', () => {
    assert.include(
      describeSignInError({ code: 'auth/unauthorized-domain' }),
      '承認済みドメイン',
    );
  });

  test('falls back to the message of anything else', () => {
    assert.strictEqual(
      describeSignInError(new Error('boom')),
      'サインインできませんでした（boom）。',
    );

    assert.strictEqual(
      describeSignInError('strange'),
      'サインインできませんでした（strange）。',
    );
  });
});
