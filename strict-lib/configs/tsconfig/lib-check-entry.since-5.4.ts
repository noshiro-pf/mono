// The assertions of `lib-check-entry.ts` that hold only from TypeScript 5.4 on.
// The `tsconfig.lib-check*.json` of the harnesses from v5.4 name this file
// beside that one; v5.0–v5.3 do not.

/**
 * #2585 — the widened parameter of a collection's `has` no longer leaks into
 * inference.
 *
 * `Set#has` / `ReadonlySet#has` / `Map#has` / `ReadonlyMap#has` take
 * `NoInfer<T | (WidenLiteral<T> & {})>`. A method parameter is bivariant, so
 * wherever `T` is inferred structurally through `has` — between `Set` and
 * `ReadonlySet`, which are different interfaces — the widened type was a
 * covariant candidate and widened `T` to `string`. `NoInfer` is an intrinsic
 * of TypeScript 5.4, so before it the parameter is still bare, and these fail.
 */
type Letter = 'a' | 'b';

// Inferred from the contextual type into `new Set`'s `Set<T>`.
export const contextualSet: ReadonlySet<Letter> = new Set(['a']);

export const contextualMap: ReadonlyMap<Letter, number> = new Map([['a', 1]]);

// Inferred from a `Set` argument into a `ReadonlySet<T>` parameter.
declare const mutableSet: Set<Letter>;

declare const mutableMap: Map<Letter, number>;

declare function elementOf<T>(set: ReadonlySet<T>): T;

declare function keyOf<K>(map: ReadonlyMap<K, unknown>): K;

export const element: Letter = elementOf(mutableSet);

export const key: Letter = keyOf(mutableMap);
