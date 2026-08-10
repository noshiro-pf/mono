import { isNonNullObject } from './is-non-null-object.mjs';

export const isRecord = (a: unknown): a is UnknownRecord =>
  isNonNullObject(a) && !Array.isArray(a);
