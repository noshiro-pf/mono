import { WarnTypeTagName } from './tag.mjs';

/**
 * Creates a `TernaryResult.Warn` containing the provided success value and
 * warning.
 *
 * @example
 *
 * ```ts
 * const caution = TernaryResult.warn({ id: 1 }, 'Needs review');
 *
 * assert.deepStrictEqual(caution, {
 *   $$tag: 'ts-data-forge::Result.warn',
 *   value: { id: 1 },
 *   warning: 'Needs review',
 * });
 * ```
 */
export const warn = <const S, const W>(
  value: S,
  warning: W,
): TernaryWarn<S, W> => ({
  $$tag: WarnTypeTagName,
  value,
  warning,
});
