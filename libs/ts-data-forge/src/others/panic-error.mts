import { isError } from '@sindresorhus/is';

/**
 * The error a panic throws: an ordinary `Error` whose `name` is
 * `'PanicError'`, so it carries a stack and prints like any error, and is
 * what `isPanicError` recognizes across realms.
 *
 * A panic is a programming error — an invariant that cannot hold — as
 * opposed to a recoverable failure carried by `Result`. The panic functions
 * themselves (`panic`, `unreachable`, `todo`) live in ts-std-forge; this
 * package holds the error's shape because its own unwrap functions throw it
 * and its boundary functions (`Result.fromThrowable`, `Result.fromPromise`,
 * `AsyncResult.fromThrowable`, `AsyncResult.fromPromise`) rethrow it rather
 * than turning it into `Err`, so a bug does not masquerade as a recoverable
 * failure.
 */
export type PanicError = Error & Readonly<{ name: 'PanicError' }>;

const panicErrorName = 'PanicError';

const panicErrorBrand: Readonly<{ name: typeof panicErrorName }> = {
  name: panicErrorName,
} as const;

/**
 * Whether `value` is a `PanicError` — thrown by ts-std-forge's `panic`, or
 * by the unwrap functions of this package (`unwrapThrow`, `expectToBe`,
 * ...) on failure.
 *
 * @example
 *
 * ```ts
 * assert.isTrue(isPanicError(createPanicError('boom')));
 *
 * assert.isFalse(isPanicError(new Error('boom')));
 * ```
 */
export const isPanicError = (value: unknown): value is PanicError =>
  isError(value) && value.name === panicErrorName;

/**
 * Builds a `PanicError` without throwing it. The unwrap functions of this
 * package and ts-std-forge's `panic` throw what this returns.
 *
 * @example
 *
 * ```ts
 * const error = createPanicError('boom', { cause: 'x' });
 *
 * assert.isTrue(error instanceof Error);
 *
 * assert.isTrue(error.name === 'PanicError');
 *
 * assert.isTrue(error.cause === 'x');
 * ```
 *
 * @param message What went wrong.
 * @param options `cause`: the underlying value, attached as `Error.cause`.
 */
export const createPanicError = (
  message: string,
  options?: Readonly<{ cause?: unknown }>,
): PanicError =>
  Object.assign(
    options?.cause === undefined
      ? new Error(message)
      : new Error(message, { cause: options.cause }),
    panicErrorBrand,
  );
