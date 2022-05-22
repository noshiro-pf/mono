import { isNonNullObject } from './is-non-null-object';

export const isRecord = (a: unknown): a is Record<string, unknown> =>
  isNonNullObject(a) &&
  // eslint-disable-next-line no-restricted-globals
  !Array.isArray(a);
