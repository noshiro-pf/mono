import { isNonNullObject } from './is-non-null-object';

export const isRecord = (a: unknown): a is Record<string, unknown> =>
  isNonNullObject(a) && !Array.isArray(a);
