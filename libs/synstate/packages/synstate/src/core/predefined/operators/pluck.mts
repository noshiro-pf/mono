import { type KeepInitialValueOperator } from '../../types/index.mjs';
import { map } from './map.mjs';

export const pluck = <A, K extends keyof A>(
  key: K,
): KeepInitialValueOperator<A, A[K]> => map((a) => a[key]);

/**
 * Alias for `pluck`.
 * @see pluck
 */
export const getKey = pluck;
