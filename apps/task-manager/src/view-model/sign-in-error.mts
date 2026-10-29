import { hasKey, isRecord, isString, unknownToString } from 'ts-data-forge';
import { m } from '../i18n/index.mjs';

/**
 * What to tell the reader when signing in failed, from the error Firebase
 * Auth threw — or `undefined` when there is nothing to tell, because they
 * closed the popup themselves.
 */
export const describeSignInError = (error: unknown): string | undefined => {
  const code = stringProperty(error, 'code');

  if (code !== undefined && SILENT_CODES.has(code)) {
    return undefined;
  }

  const known = code === undefined ? undefined : MESSAGES.get(code);

  return (
    known ??
    m.signIn.failed(stringProperty(error, 'message') ?? unknownToString(error))
  );
};

/** The reader closed the popup, or opened a second one: nothing failed. */
const SILENT_CODES: ReadonlySet<string> = new Set<string>([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

const MESSAGES: ReadonlyMap<string, string> = new Map<string, string>([
  ['auth/popup-blocked', m.signIn.popupBlocked],
  ['auth/unauthorized-domain', m.signIn.unauthorizedDomain],
  ['auth/network-request-failed', m.signIn.network],
]);

const stringProperty = (value: unknown, key: string): string | undefined =>
  isRecord(value) && hasKey(value, key) && isString(value[key])
    ? value[key]
    : undefined;
