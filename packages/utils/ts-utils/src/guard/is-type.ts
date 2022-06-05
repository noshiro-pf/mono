export const isUndefined = (a: unknown): a is undefined =>
  typeof a === 'undefined';

export const isNotUndefined = <T>(a: T): a is RelaxedExclude<T, undefined> =>
  typeof a !== 'undefined';

export const isBoolean = (a: unknown): a is boolean => typeof a === 'boolean';

export const isNotBoolean = <T>(a: T): a is RelaxedExclude<T, boolean> =>
  typeof a !== 'boolean';

export const isNumber = (a: unknown): a is number => typeof a === 'number';

export const isNotNumber = <T>(a: T): a is RelaxedExclude<T, number> =>
  typeof a !== 'number';

export const isBigint = (a: unknown): a is bigint => typeof a === 'bigint';

export const isNotBigint = <T>(a: T): a is RelaxedExclude<T, bigint> =>
  typeof a !== 'bigint';

export const isString = (a: unknown): a is string => typeof a === 'string';

export const isNotString = <T>(a: T): a is RelaxedExclude<T, string> =>
  typeof a !== 'string';

export const isSymbol = (a: unknown): a is symbol => typeof a === 'symbol';

export const isNotSymbol = <T>(a: T): a is RelaxedExclude<T, symbol> =>
  typeof a !== 'symbol';

export const isNull = (a: unknown): a is null => a === null;

export const isNotNull = <T>(a: T | null): a is T => a !== null;

export const isNullable = (a: unknown): a is null | undefined => a == null;

export const isNotNullable = <T>(a: T): a is NonNullable<T> => a != null;
