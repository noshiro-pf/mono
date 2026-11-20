import { credentialErrorOf, reauthErrorOf } from './credential-error.mjs';

describe(credentialErrorOf, () => {
  test.each([
    { code: 'auth/wrong-password', expected: 'wrongPassword' },
    { code: 'auth/user-not-found', expected: 'userNotFound' },
    // What Firebase reports for either of the two above when email enumeration
    // protection is on.
    { code: 'auth/invalid-credential', expected: 'wrongEmailOrPassword' },
    { code: 'auth/too-many-requests', expected: undefined },
    { code: 'auth/network-request-failed', expected: undefined },
  ] as const)('$code is $expected', ({ code, expected }) => {
    assert.strictEqual(credentialErrorOf(code), expected);
  });
});

describe(reauthErrorOf, () => {
  test.each([
    { code: 'auth/wrong-password', expected: 'wrongPassword' },
    // What signing in again reports for an email of no account when email
    // enumeration protection is off.
    { code: 'auth/user-mismatch', expected: 'wrongEmail' },
    { code: 'auth/invalid-credential', expected: 'wrongEmailOrPassword' },
    // Signing in again never reports it; nothing is marked if it ever does.
    { code: 'auth/user-not-found', expected: undefined },
    { code: 'auth/too-many-requests', expected: undefined },
    { code: undefined, expected: undefined },
  ] as const)('$code is $expected', ({ code, expected }) => {
    assert.strictEqual(reauthErrorOf(code), expected);
  });
});
