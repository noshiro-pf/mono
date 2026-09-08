import { isError } from '@sindresorhus/is';
import { isRecord } from '../guard/index.mjs';

/**
 * The key that marks an error as a panic (Sumi D-48).
 *
 * It is a dedicated property rather than the error's `name`, which is where
 * the class-free error factory of D-27 (`Object.assign(new Error(message),
 * { name: 'HttpError', kind: 'http' } as const)`) puts a custom error's own
 * identity. Marking on `name` would make the two compete: an existing error
 * could either keep what it is or be recognized as a panic, never both. With
 * a separate key, {@link panic} can mark an error the caller already holds
 * and throw that very object — original `name`, tag, payload and stack
 * intact — and the boundary functions still rethrow it.
 *
 * The spelling follows the `$$tag` discriminant of `Result` and `Optional`.
 */
const panicBrandKey = '$$panic';

/**
 * An `Error` marked as a panic: the program is stopping because an invariant
 * that must hold does not. `name` is free — `createPanicError` sets it to
 * `'PanicError'` so that a bare panic prints as one, while an error marked by
 * `panic(error)` keeps the name its factory gave it.
 */
export type PanicError = Error & Readonly<{ [panicBrandKey]: true }>;

const panicMark: Readonly<{ [panicBrandKey]: true }> = {
  [panicBrandKey]: true,
} as const;

const panicErrorBrand: Readonly<{ name: 'PanicError'; [panicBrandKey]: true }> =
  { name: 'PanicError', ...panicMark } as const;

/**
 * Whether a caught value is a panic. Matches on the mark, not on the
 * constructor, so an error that crossed a package boundary — or came from
 * another copy of this library — is recognized just the same.
 */
export const isPanicError = (value: unknown): value is PanicError =>
  isError(value) && isRecord(value) && value[panicBrandKey] === true;

/**
 * Builds a fresh panic error. `panic(message)` throws what this returns;
 * call it directly only when the error has to be produced without being
 * thrown.
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

/**
 * Marks an error the caller already holds as a panic and returns that same
 * object, so its `name`, its tag, its payload and above all its stack — which
 * points at where the failure happened, not at the panic — survive.
 * `panic(error)` is this plus the throw.
 *
 * A frozen error cannot be marked, so it is wrapped instead: the result is a
 * fresh panic carrying it as `cause`.
 */
export const markAsPanic = (
  // The parameter cannot be `Readonly<Error>`, and the assignment cannot be a
  // copy: marking the caller's own object in place is the whole point — a new
  // error would carry a stack pointing here rather than at the failure.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  error: Error,
): PanicError =>
  Object.isFrozen(error)
    ? createPanicError(error.message, { cause: error })
    : // eslint-disable-next-line functional/immutable-data
      Object.assign(error, panicMark);
