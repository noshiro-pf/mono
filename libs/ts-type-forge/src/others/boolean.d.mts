/**
 * Performs a logical NOT operation on a boolean literal type `A`.
 * This is the type-level equivalent of the JavaScript `!` operator.
 *
 * @template A - A boolean literal type (`true` or `false`).
 * @returns The logical negation of `A`: `false` if `A` is `true`, `true` if `A` is `false`.
 *
 * @example
 * ```ts
 * type Result1 = BoolNot<true>;  // false
 * type Result2 = BoolNot<false>; // true
 *
 * // Useful in conditional types
 * type IsDisabled<T> = T extends { enabled: infer E }
 *   ? E extends boolean
 *     ? BoolNot<E>
 *     : never
 *   : true;
 *
 * type Test1 = IsDisabled<{ enabled: true }>;  // false
 * type Test2 = IsDisabled<{ enabled: false }>; // true
 * ```
 */
type BoolNot<A extends boolean> =
  TypeEq<A, true> extends true
    ? false
    : TypeEq<A, false> extends true
      ? true
      : never;

/**
 * Performs a logical AND operation on two boolean literal types `A` and `B`.
 * This is the type-level equivalent of the JavaScript `&&` operator.
 * Returns `true` only when both operands are `true`.
 *
 * @template A - The first boolean literal type (`true` or `false`).
 * @template B - The second boolean literal type (`true` or `false`).
 * @returns `true` if both `A` and `B` are `true`, `false` otherwise.
 *
 * @example
 * ```ts
 * type T_T = BoolAnd<true, true>;   // true
 * type T_F = BoolAnd<true, false>;  // false
 * type F_T = BoolAnd<false, true>;  // false
 * type F_F = BoolAnd<false, false>; // false
 *
 * // Useful for combining conditions
 * type HasBothFlags<T> = T extends { flagA: infer A, flagB: infer B }
 *   ? A extends boolean
 *     ? B extends boolean
 *       ? BoolAnd<A, B>
 *       : false
 *     : false
 *   : false;
 * ```
 */
type BoolAnd<A extends boolean, B extends boolean> =
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
        ? false
        : never
    : TypeEq<A, false> extends true
      ? TypeEq<B, true> extends true
        ? false
        : TypeEq<B, false> extends true
          ? false
          : never
      : never;

/**
 * Performs a logical OR operation on two boolean literal types `A` and `B`.
 * This is the type-level equivalent of the JavaScript `||` operator.
 * Returns `true` when at least one operand is `true`.
 *
 * @template A - The first boolean literal type (`true` or `false`).
 * @template B - The second boolean literal type (`true` or `false`).
 * @returns `true` if either `A` or `B` (or both) is `true`, `false` otherwise.
 *
 * @example
 * ```ts
 * type T_T = BoolOr<true, true>;   // true
 * type T_F = BoolOr<true, false>;  // true
 * type F_T = BoolOr<false, true>;  // true
 * type F_F = BoolOr<false, false>; // false
 *
 * // Useful for fallback conditions
 * type HasAnyFlag<T> = T extends { flagA: infer A, flagB: infer B }
 *   ? A extends boolean
 *     ? B extends boolean
 *       ? BoolOr<A, B>
 *       : A
 *     : B extends boolean
 *       ? B
 *       : false
 *   : false;
 * ```
 */
type BoolOr<A extends boolean, B extends boolean> =
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
        ? true
        : never
    : TypeEq<A, false> extends true
      ? TypeEq<B, true> extends true
        ? true
        : TypeEq<B, false> extends true
          ? false
          : never
      : never;

/**
 * Performs a logical equality (XNOR) operation on two boolean literal types `A` and `B`.
 * Returns `true` if both `A` and `B` are the same, `false` otherwise.
 * @template A - The first boolean literal type (`true` or `false`).
 * @template B - The second boolean literal type (`true` or `false`).
 * @example
 * type T_T = BoolEq<true, true>;   // true
 * type T_F = BoolEq<true, false>;  // false
 * type F_T = BoolEq<false, true>;  // false
 * type F_F = BoolEq<false, false>; // true
 */
type BoolEq<A extends boolean, B extends boolean> =
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
        ? false
        : never
    : TypeEq<A, false> extends true
      ? TypeEq<B, true> extends true
        ? false
        : TypeEq<B, false> extends true
          ? true
          : never
      : never;

/**
 * Performs a logical NAND (NOT AND) operation on two boolean literal types `A` and `B`.
 * @template A - The first boolean literal type (`true` or `false`).
 * @template B - The second boolean literal type (`true` or `false`).
 * @example
 * type T_T = BoolNand<true, true>;   // false
 * type T_F = BoolNand<true, false>;  // true
 * type F_T = BoolNand<false, true>;  // true
 * type F_F = BoolNand<false, false>; // true
 */
type BoolNand<A extends boolean, B extends boolean> = BoolNot<BoolAnd<A, B>>;

/**
 * Performs a logical NOR (NOT OR) operation on two boolean literal types `A` and `B`.
 * @template A - The first boolean literal type (`true` or `false`).
 * @template B - The second boolean literal type (`true` or `false`).
 * @example
 * type T_T = BoolNor<true, true>;   // false
 * type T_F = BoolNor<true, false>;  // false
 * type F_T = BoolNor<false, true>;  // false
 * type F_F = BoolNor<false, false>; // true
 */
type BoolNor<A extends boolean, B extends boolean> = BoolNot<BoolOr<A, B>>;

/**
 * Performs a logical inequality (XOR) operation on two boolean literal types `A` and `B`.
 * Returns `true` if `A` and `B` are different, `false` otherwise.
 * @template A - The first boolean literal type (`true` or `false`).
 * @template B - The second boolean literal type (`true` or `false`).
 * @example
 * type T_T = BoolNeq<true, true>;   // false
 * type T_F = BoolNeq<true, false>;  // true
 * type F_T = BoolNeq<false, true>;  // true
 * type F_F = BoolNeq<false, false>; // false
 */
type BoolNeq<A extends boolean, B extends boolean> = BoolNot<BoolEq<A, B>>;
