import { credentialErrorOf } from './credential-error.mjs';

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
