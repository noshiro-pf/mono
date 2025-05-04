/**
 * Increments a non-negative integer literal type `N` by 1.
 * It works by creating a tuple of length `N`, prepending an element, and taking the new length.
 *
 * @template N - A non-negative integer literal type.
 * @returns The number literal type `N + 1`.
 * @example
 * type Five = Increment<4>; // 5
 * type One = Increment<0>; // 1
 */
type Increment<N extends number> = (readonly [0, ...MakeTuple<0, N>])['length'];

/**
 * Decrements a positive integer literal type `N` by 1.
 * It works by creating a tuple of length `N`, removing the first element (Tail), and taking the new length.
 *
 * @template N - A positive integer literal type (must be >= 1).
 * @returns The number literal type `N - 1`.
 * @example
 * type Three = Decrement<4>; // 3
 * type Zero = Decrement<1>; // 0
 * // type Error = Decrement<0>; // Likely results in an error or never
 */
type Decrement<N extends number> = List.Tail<MakeTuple<0, N>>['length'];
