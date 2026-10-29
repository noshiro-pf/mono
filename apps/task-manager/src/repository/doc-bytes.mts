import { Arr, isNumber, isRecord, isString } from 'ts-data-forge';

/**
 * How many bytes Firestore counts a value as stored
 * (https://firebase.google.com/docs/firestore/storage-size): a string its
 * UTF-8 bytes and one, a number eight, a boolean or `null` one, a map each
 * key as a string plus its value, an array its elements. Values of other
 * kinds, which these documents do not hold, count as nothing.
 */
export const docBytes = (value: unknown): number =>
  Arr.isArray(value)
    ? Arr.sum(value.map(docBytes))
    : isRecord(value)
      ? Arr.sum(
          Object.entries(value).map(
            ([key, field]) => docBytes(key) + docBytes(field),
          ),
        )
      : isString(value)
        ? utf8Bytes(value) + 1
        : isNumber(value)
          ? 8
          : value === null || typeof value === 'boolean'
            ? 1
            : 0;

/** How many bytes `s` is in UTF-8. */
export const utf8Bytes = (s: string): number => encoder.encode(s).length;

const encoder = new TextEncoder();
