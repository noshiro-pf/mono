import { OkTypeTagName } from './tag.mjs';

/**
 * Creates a `TernaryResult.Ok` containing the provided value.
 *
 * @example
 *
 * ```ts
 * const success = TernaryResult.ok({ id: 1 });
 *
 * assert.deepStrictEqual(success, {
 *   $$tag: 'ts-data-forge::Result.ok',
 *   value: { id: 1 },
 * });
 * ```
 */
export const ok = <const S,>(value: S): TernaryOk<S> => ({
  $$tag: OkTypeTagName,
  value,
});
