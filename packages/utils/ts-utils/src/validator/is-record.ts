import { isNonNullObject } from './is-non-null-object';

/** @deprecated WIP */
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  isNonNullObject(v) &&
  // eslint-disable-next-line no-restricted-globals
  !Array.isArray(v) &&
  // eslint-disable-next-line no-restricted-globals
  !(v instanceof Map) &&
  // eslint-disable-next-line no-restricted-globals
  !(v instanceof Set);
