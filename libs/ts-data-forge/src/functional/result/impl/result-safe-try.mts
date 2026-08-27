import { hasKey, isRecord } from '../../../guard/index.mjs';
import { type Err } from '../../../types.mjs';
import { type Result, type UnknownResult } from '../result.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Runs a generator body in which `yield* Result.safeUnwrap(...)` unwraps `Ok`
 * values and short-circuits on the first `Err`, emulating Rust's `?` operator
 * (early-return error propagation).
 *
 * The body must return a `Result`. If every unwrapped `Result` is `Ok`, the
 * returned value is the body's `Result`; otherwise it is the first `Err`
 * encountered, and the rest of the body never runs.
 *
 * Passing an async generator (`async function*`) returns a
 * `Promise<Result<...>>` instead, so `await` can be used inside the body.
 *
 * @example
 *
 * ```ts
 * const parseTwo = (
 *   a: string,
 *   b: string,
 * ): Result<number, SyntaxError | TypeError> =>
 *   Result.safeTry(function* () {
 *     const x = yield* Result.safeUnwrap(Num.safeParseInt(a, 10));
 *
 *     const y = yield* Result.safeUnwrap(Num.safeParseInt(b, 10));
 *
 *     return Result.ok(x + y);
 *   });
 *
 * assert.deepStrictEqual(parseTwo('1', '2'), Result.ok(3));
 *
 * assert.isTrue(Result.isErr(parseTwo('1', 'not a number')));
 * ```
 *
 * @template Y The union of `Err` types unwrapped via
 *   {@link Result.safeUnwrap} (`never` if nothing is unwrapped).
 * @template R2 The `Result` type returned by the body.
 * @param body A generator function whose `yield*` expressions delegate to
 *   {@link Result.safeUnwrap} and whose return value is a `Result`.
 * @returns The body's `Result`, or the first `Err` short-circuited out of it
 *   (wrapped in a `Promise` for an async generator body).
 */
export function safeTry<Y extends Err<unknown>, R2 extends UnknownResult>(
  body: () => Generator<Y, R2>,
): Result<UnwrapOk<R2>, UnwrapErr<R2> | UnwrapErr<Y>>;

export function safeTry<Y extends Err<unknown>, R2 extends UnknownResult>(
  body: () => AsyncGenerator<Y, R2>,
): Promise<Result<UnwrapOk<R2>, UnwrapErr<R2> | UnwrapErr<Y>>>;

export function safeTry(
  body:
    | (() => AsyncGenerator<UnknownResult, UnknownResult>)
    | (() => Generator<UnknownResult, UnknownResult>),
): Promise<UnknownResult> | UnknownResult {
  // A yielded `Err` and a returned `Result` are both already the final
  // answer, so the first step's `value` is the result in either case: the
  // generator is never resumed after yielding.
  const step = body().next();

  return isSyncStep(step) ? step.value : step.then((s) => s.value);
}

// A sync generator's `next()` returns a plain `{ value, done }` object with
// own properties, while an async generator's returns a `Promise`, whose
// `then` lives on the prototype — so an own-key check on `done` separates the
// two.
const isSyncStep = (
  value: unknown,
): value is IteratorResult<UnknownResult, UnknownResult> =>
  isRecord(value) && hasKey(value, 'done');
