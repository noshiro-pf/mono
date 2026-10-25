import { hasKey, isRecord, isString, unknownToString } from 'ts-data-forge';

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
    `サインインできませんでした（${stringProperty(error, 'message') ?? unknownToString(error)}）。`
  );
};

/** The reader closed the popup, or opened a second one: nothing failed. */
const SILENT_CODES: ReadonlySet<string> = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

const MESSAGES: ReadonlyMap<string, string> = new Map([
  [
    'auth/popup-blocked',
    'ポップアップがブロックされました。このページのポップアップを許可して、もう一度お試しください。',
  ],
  [
    'auth/unauthorized-domain',
    'このドメインからのサインインは許可されていません。Firebase の承認済みドメインに追加してください。',
  ],
  [
    'auth/network-request-failed',
    'ネットワークに接続できませんでした。接続を確認して、もう一度お試しください。',
  ],
]);

const stringProperty = (value: unknown, key: string): string | undefined =>
  isRecord(value) && hasKey(value, key) && isString(value[key])
    ? value[key]
    : undefined;
