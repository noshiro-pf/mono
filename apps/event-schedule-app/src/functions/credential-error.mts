/**
 * What a failed email-and-password sign-in, or signing in again before an
 * account change, says is wrong with what was typed, or `undefined` for a
 * failure that is not about it.
 *
 * Every form that signs in with a password reads its error through this, not by
 * matching the code itself: with email enumeration protection on (the default
 * for Firebase projects made since September 2023), Firebase reports a wrong
 * password and an unknown email alike as `auth/invalid-credential`, and a form
 * that knew only `auth/wrong-password` showed it as an unknown error (#2955).
 * The rule in `eslint.config.mts` that names this file keeps those two codes
 * here.
 */
export const credentialErrorOf = (
  code: string,
): CredentialError | undefined => {
  switch (code) {
    case 'auth/wrong-password':
      return 'wrongPassword';

    case 'auth/user-not-found':
      return 'userNotFound';

    case 'auth/invalid-credential':
      return 'wrongEmailOrPassword';

    default:
      return undefined;
  }
};

/**
 * `wrongEmailOrPassword` is what email enumeration protection reports instead
 * of the other two, which it no longer tells apart.
 */
export type CredentialError =
  'wrongPassword' | 'userNotFound' | 'wrongEmailOrPassword';
