/**
 * The fallback error for a throw the wrapper could not classify in advance.
 *
 * Every wrapper validates the ECMAScript-specified throw conditions before
 * calling the raw API, so a spec-defined failure always comes back as a
 * function-specific tagged error. What remains is the implementation-defined
 * residue — conditions the spec leaves to the engine, such as the maximum
 * string length `String.prototype.repeat` can produce — which cannot be
 * predicted portably. Those throws are caught by the `Result.fromThrowable`
 * backstop and surfaced with this kind, with the engine's `Error` attached
 * as `cause`.
 */
export type UnexpectedError = Readonly<{
  kind: 'unexpected';
  cause: Readonly<Error>;
}>;

/**
 * Wraps a caught `Error` as an {@link UnexpectedError}. Used as the `mapErr`
 * argument on each wrapper's `Result.fromThrowable` backstop.
 */
export const toUnexpectedError = (cause: Readonly<Error>): UnexpectedError =>
  ({
    kind: 'unexpected',
    cause,
  }) as const;
