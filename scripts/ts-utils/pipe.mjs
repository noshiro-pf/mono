/**
 * @template A
 * @typedef {Readonly<{
 *   value: A;
 *   chain: <B>(fn: (a: A) => B) => Pipe<B>;
 *   chainOptional: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
 * }>} Pipe<A>
 */

/**
 * @template A
 * @param {A} a
 * @returns {Pipe<A>}
 */
export const pipe = (a) => ({
  value: a,
  chain: (fn) => pipe(fn(a)),
  chainOptional: (fn) => pipe(a == null ? undefined : fn(a)),
});
