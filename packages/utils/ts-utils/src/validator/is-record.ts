import { isNonNullObject } from './is-non-null-object';

/** @deprecated WIP */
export const isRecord = (v: unknown): v is Record<string, unknown> =>
  isNonNullObject(v) &&
  !Array.isArray(v) &&
  !(v instanceof Map) &&
  !(v instanceof Set);
