import { isNonNullObject } from './is-non-null-object.mjs';

export const isRecord = (a: unknown): a is Record<string, unknown> =>
  isNonNullObject(a) && !Array.isArray(a);
