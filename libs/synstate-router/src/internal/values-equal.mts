import { fastDeepEqual } from 'ts-data-forge';

/**
 * Whether two search values are the same: `Object.is` for scalars, structure
 * for arrays and objects.
 */
export const valuesEqual = (a: unknown, b: unknown): boolean =>
  Object.is(a, b) || fastDeepEqual(a, b);
