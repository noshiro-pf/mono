import { unknownToString } from '../others/index.mjs';
import { createPanicError, markAsPanic } from './panic-error.mjs';

/**
 * Stops the program on a programming error — an invariant that cannot hold
 * — by throwing a {@link PanicError} (Sumi D-48). This is the counterpart of
 * Rust's `panic!`: not an error-handling path (that is `Result`), but the
 * assertion that reaching this point is a bug. The boundary functions
 * (`Result.fromThrowable`, `Result.fromPromise`, `AsyncResult.fromThrowable`,
 * `AsyncResult.fromPromise`) rethrow a `PanicError` rather than turning it
 * into `Err`, so a bug does not masquerade as a recoverable failure. It is
 * also how this package's own `unwrapThrow` / `expectToBe` families stop:
 * they call `panic` rather than throwing directly.
 *
 * Declared with an explicit `never` return type so that TypeScript treats a
 * call as terminating (control-flow analysis honours `never` only on
 * annotated declarations; an overloaded declaration works the same way).
 *
 * Takes either a message or an error the caller already holds. Given an
 * error, that very object is thrown, marked as a panic: its `name`, its tag,
 * its payload and its stack — pointing at where the failure happened rather
 * than at this call — all survive, which is what makes `throw error` port to
 * `panic(error)` without losing anything.
 *
 * @example
 *
 * ```ts
 * const get = (map: ReadonlyMap<string, number>, key: string): number =>
 *   map.get(key) ?? panic(`missing key: ${key}`);
 *
 * assert.throws(() => get(new Map(), 'a'), Error, 'missing key: a');
 * ```
 *
 * @example
 *
 * ```ts
 * const boom = new Error('boom');
 *
 * assert.throws(() => panic(boom), Error, 'boom');
 * ```
 *
 * @param reason What went wrong: a message, or an error to mark and rethrow.
 * @param options `cause`: the underlying value, attached as `Error.cause`.
 *   Only meaningful with a message — an error carries its own.
 * @throws {PanicError} Always.
 */
export function panic(
  message: string,
  options?: Readonly<{ cause?: unknown }>,
): never;

// `Readonly<Error>` here and below would be a lie: this overload hands the
// error to `markAsPanic`, which marks that very object in place so that its
// stack keeps pointing at the failure.
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function panic(error: Error): never;

// Written as a named function rather than an arrow, because that is how an
// overload is spelled: an arrow would need its type as an object holding call
// signatures, and `Readonly<...>` over such an object erases them.
export function panic(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reason: Error | string,
  options?: Readonly<{ cause?: unknown }>,
): never {
  throw typeof reason === 'string'
    ? createPanicError(reason, options)
    : markAsPanic(reason);
}

/**
 * Panics on a value that the types say cannot exist — the exhaustiveness
 * check of a `switch` over a union.
 *
 * @example
 *
 * ```ts
 * type Shape = { kind: 'circle' } | { kind: 'square' };
 *
 * const area = (shape: Shape): number => {
 *   switch (shape.kind) {
 *     case 'circle':
 *       return 1;
 *     case 'square':
 *       return 2;
 *     default:
 *       return unreachable(shape);
 *   }
 * };
 *
 * assert.isTrue(area({ kind: 'circle' }) === 1);
 * ```
 *
 * @param value The value the types exclude; its string form goes into the
 *   message when no message is given.
 * @param message Overrides the default message.
 * @throws {PanicError} Always.
 */
export const unreachable: (value: never, message?: string) => never = (
  value,
  message,
) =>
  panic(
    message ??
      `Reached code the types mark unreachable: ${unknownToString(value)}`,
  );

/**
 * Panics with "not implemented" — the placeholder for a code path that is
 * yet to be written.
 *
 * @example
 *
 * ```ts
 * const parse = (_input: string): number => todo('parse');
 *
 * assert.throws(() => parse('x'), Error, 'not implemented: parse');
 * ```
 *
 * @param message What is missing, appended to the message.
 * @throws {PanicError} Always.
 */
export const todo: (message?: string) => never = (message) =>
  panic(
    message === undefined ? 'not implemented' : `not implemented: ${message}`,
  );
