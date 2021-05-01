export const isUndefined = (value: unknown): value is undefined =>
  typeof value === 'undefined';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isNotUndefined = <T>(value: T): value is Exclude<T, undefined> =>
  typeof value !== 'undefined';

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isNotBoolean = <T>(value: T): value is Exclude<T, boolean> =>
  typeof value !== 'boolean';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isNotNumber = <T>(value: T): value is Exclude<T, number> =>
  typeof value !== 'number';

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isNotString = <T>(value: T): value is Exclude<T, string> =>
  typeof value !== 'string';

export const isSymbol = (value: unknown): value is symbol =>
  typeof value === 'symbol';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isNotSymbol = <T>(value: T): value is Exclude<T, symbol> =>
  typeof value !== 'symbol';

export const isNull = (value: unknown): value is null => value === null;

export const isNotNull = <T>(value: T | null): value is T => value !== null;
