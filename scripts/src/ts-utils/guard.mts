export const isRecord = (a: unknown): a is UnknownRecord =>
  typeof a === 'object' && a !== null && !Array.isArray(a);

export const isNotUndefined = <T,>(a: T): a is RelaxedExclude<T, undefined> =>
  a !== undefined;

export const isNumber = (a: unknown): a is number => typeof a === 'number';

export const isString = (a: unknown): a is string => typeof a === 'string';

export const isNonNullish = <T,>(a: T): a is NonNullable<T> => a != null;
