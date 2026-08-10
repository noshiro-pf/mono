/**
 * A type utility that makes the parameters of a function type `F` bivariant.
 *
 * By default, function parameters in TypeScript are contravariant. This "hack"
 * leverages a structural typing trick with object methods (which are bivariant in their parameters)
 * to bypass the stricter contravariance check.
 *
 * This is typically used in scenarios like defining event handlers or callbacks within
 * object types where strict contravariance might be too restrictive for practical use,
 * allowing assignment of functions with more specific parameter types.
 *
 * Use with caution, as it intentionally weakens type safety for parameter types.
 *
 * @template F - The function type whose parameters should be made bivariant.
 * @example
 * ```ts
 * type Handler = (arg: { a: string }) => void;
 * type SpecificHandler = (arg: { a: string; b: number }) => void;
 *
 * declare const specific: SpecificHandler;
 *
 * // Normally this assignment is invalid, because function parameters are
 * // contravariant:
 * // const handler: Handler = specific;
 * // Type '(arg: { a: string; b: number; }) => void' is not assignable to
 * // type '(arg: { a: string; }) => void'.
 *
 * // BivariantHack makes the parameter bivariant, so it is accepted:
 * const bivariantHandler: BivariantHack<Handler> = specific;
 * ```
 */
export type BivariantHack<F extends (...args: readonly never[]) => unknown> = {
  // eslint-disable-next-line @typescript-eslint/method-signature-style, functional/prefer-property-signatures
  bivariantHack(...args: Parameters<F>): ReturnType<F>;
}['bivariantHack'];
