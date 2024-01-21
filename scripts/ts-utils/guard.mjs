/**
 * @param {unknown} a
 * @returns {a is Record<string, unknown>}
 */
export const isRecord = (a) =>
  typeof a === 'object' && a !== null && !Array.isArray(a);

/**
 * @template T
 * @param {T} a
 * @returns {a is Exclude<T, undefined>}
 */
export const isNotUndefined = (a) => a !== undefined;

/**
 * @param {unknown} a
 * @returns {a is number}
 */
export const isNumber = (a) => typeof a === 'number';

/**
 * @param {unknown} a
 * @returns {a is string}
 */
export const isString = (a) => typeof a === 'string';

/**
 * @template T
 * @param {T} a
 * @returns {a is NonNullable<T>}
 */
export const isNonNullish = (a) => a != null;
