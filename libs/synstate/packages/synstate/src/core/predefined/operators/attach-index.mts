import { mapWithIndex } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

export const withIndex = <A,>(): KeepInitialValueOperator<
  A,
  readonly [SafeUint | -1, A]
> => mapWithIndex((a, i) => [i, a] as const);

/**
 * Alias for `withIndex`.
 * @see withIndex
 */
export const attachIndex = withIndex;
