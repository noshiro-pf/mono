import { createPanicError, unknownToString } from 'ts-data-forge';

/**
 * Stops the program on a programming error — an invariant that cannot hold
 * — by throwing ts-data-forge's `PanicError` (Sumi D-48). This is the
 * counterpart of Rust's `panic!`: not an error-handling path (that is
 * `Result`), but the assertion that reaching this point is a bug. The
 * boundary functions of ts-data-forge (`Result.fromThrowable`,
 * `Result.fromPromise`, `AsyncResult.fromThrowable`,
 * `AsyncResult.fromPromise`) rethrow a `PanicError` rather than turning it
 * into `Err`, so a bug does not masquerade as a recoverable failure.
 *
 * Declared with an explicit type so that TypeScript treats a call as
 * terminating (control-flow analysis honours `never` only on annotated
 * declarations).
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
 * @param message What went wrong.
 * @param options `cause`: the underlying value, attached as `Error.cause`.
 * @throws {PanicError} Always.
 */
export const panic: (
  message: string,
  options?: Readonly<{ cause?: unknown }>,
) => never = (message, options) => {
  throw createPanicError(message, options);
};

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
