import { Arr, isNonNullObject } from 'ts-data-forge';

/**
 * Whether the document was loaded by a reload, or by back or forward to it,
 * read from `performance` (navigation timing). Where there is none (jsdom, a
 * server), it reads as a plain load.
 */
export const isRestoredLoad = (performance: unknown): boolean => {
  if (!isNonNullObject(performance)) {
    return false;
  }

  const getEntriesByType: unknown = Reflect.get(
    performance,
    'getEntriesByType',
  );

  if (typeof getEntriesByType !== 'function') {
    return false;
  }

  const entries: unknown = Reflect.apply(getEntriesByType, performance, [
    'navigation',
  ]);

  const first: unknown = Arr.isArray(entries) ? entries[0] : undefined;

  const type: unknown = isNonNullObject(first)
    ? Reflect.get(first, 'type')
    : undefined;

  return type === 'reload' || type === 'back_forward';
};
