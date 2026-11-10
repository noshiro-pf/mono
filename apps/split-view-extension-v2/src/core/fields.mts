import { isString, isUint32 } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The small readers every codec in `core/` uses: what storage, a message or the
 * URL hands over is `unknown` or may be empty, and each read narrows it the
 * same way.
 */

/**
 * `new URL` in a `try`: `URL.canParse` arrived in Chrome 120, and the manifest
 * allows 116.
 */
export const parseUrl = (address: string): URL | undefined => {
  try {
    return new URL(address);
  } catch {
    return undefined;
  }
};

/** A finite number at `key`, or `undefined`. */
export const numberField = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): number | undefined => {
  const field = record[key];

  return typeof field === 'number' && Number.isFinite(field)
    ? field
    : undefined;
};

/** A string at `key`, or `undefined`. */
export const stringField = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): string | undefined => {
  const field = record[key];

  return isString(field) ? field : undefined;
};

/** Text with something in it, or `undefined` for none or `''`. */
export const nonEmpty = (
  text: string | null | undefined,
): string | undefined =>
  text === null || text === undefined || text === '' ? undefined : text;

/** A pane id: a whole number from 0, as the reducer hands them out. */
export const asPaneId = (value: unknown): number | undefined =>
  typeof value === 'number' && isUint32(value) ? value : undefined;
