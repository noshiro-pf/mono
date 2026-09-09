import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';
import { Result } from '../../functional/index.mjs';

/**
 * The largest value `length` may take. An array index is a uint32, so
 * `Array(2 ** 32)` is the first length the specification rejects.
 */
const maxArrayLength = 2 ** 32 - 1;

/**
 * Creates an array of `length` elements, every one of them `init` — the
 * alternative to `Array(n)` / `new Array(n)`.
 *
 * `Array(n)` is a constructor call whose function form means something else
 * entirely (`Array(1, 2)` is a two-element array, `Array(2)` a two-element
 * hole), which is why Sumi forbids it (D-15 / D-41). Its failure mode is
 * split in two, and both halves are why this returns a `Result`:
 *
 * - `Array(-1)`, `Array(1.5)` and `Array(2 ** 32)` throw a `RangeError`. That
 *   is the spec-defined condition, validated here before the array is built
 *   and reported as `{ kind: 'invalid-length', length }`.
 * - Writing the same thing as `Array.from({ length: -1 })` — the usual way to
 *   avoid the constructor — throws nothing and returns `[]`, because
 *   `ToLength` clamps. `Array.from({ length: 1.5 })` gives one element. A
 *   caller who computed the length is handed a silently wrong array, which is
 *   exactly the sentinel this package exists to replace.
 *
 * A length that is valid but too large to allocate is the engine's own limit
 * rather than a spec-defined condition, so it arrives through the
 * `Result.fromThrowable` backstop as `'unexpected'`.
 *
 * The result is `readonly V[]`: a literal length is better written as an array
 * literal (`[0, 0, 0]`), which needs no unwrapping and gives a tuple type, so
 * this exists for the lengths that are computed and therefore have no length
 * type to carry.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeArray.create(3, 1);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * assert.deepStrictEqual(okResult.value, [1, 1, 1]);
 *
 * const errResult = SafeArray.create(-1, 1);
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'invalid-length',
 *   length: -1,
 * });
 * ```
 *
 * @template V - The element type.
 * @param length - How many elements to create: an integer in
 *   `[0, 2 ** 32 - 1]`.
 * @param init - The value every element takes. Stored by reference, so an
 *   object `init` is shared by every element.
 * @returns `Ok<readonly V[]>`, or a tagged `Err` — `'invalid-length'` for the
 *   spec-defined failure, `'unexpected'` when the engine cannot allocate an
 *   array that long.
 */
export const create = <const V,>(
  length: number,
  init: V,
): Result<readonly V[], CreateError> => {
  // `isSafeInteger` rather than `isInteger`: the two agree on everything at
  // or below `maxArrayLength`, which is well inside the safe range.
  if (!Number.isSafeInteger(length) || length < 0 || length > maxArrayLength) {
    return Result.err({ kind: 'invalid-length', length });
  }

  return Result.mapErr(
    Result.fromThrowable(() => Array.from({ length }, () => init)),
    toUnexpectedError,
  );
};

/** The failure type of {@link create}. */
export type CreateError =
  Readonly<{ kind: 'invalid-length'; length: number }> | UnexpectedError;
