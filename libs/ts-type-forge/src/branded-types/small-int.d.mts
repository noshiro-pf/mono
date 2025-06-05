/**
 * Union type of small integer literals for type-level operations.
 * Provides literal integer types within a small range for precise typing.
 *
 * @template T - Constraint specifying which integers to include:
 *   - `''`    : All integers in `[-MaxIndex, MaxIndex - 1]`
 *   - `'!=0'` : All integers except 0
 *   - `'<0'`  : Negative integers only `[-MaxIndex, -1]`
 *   - `'<=0'` : Non-positive integers `[-MaxIndex, 0]`
 *   - `'>0'`  : Positive integers only `[1, MaxIndex - 1]`
 *   - `'>=0'` : Non-negative integers `[0, MaxIndex - 1]`
 * @template MaxIndex - Maximum absolute value for the range (default: 40)
 *
 * @example
 * ```ts
 * type DiceValue = SmallInt<'>0', 7>; // 1 | 2 | 3 | 4 | 5 | 6
 * type Temperature = SmallInt<'', 101>; // -100 to 100
 * type Countdown = SmallInt<'>=0', 11>; // 0 | 1 | 2 | ... | 10
 * type Offset = SmallInt<'!=0', 6>; // -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5
 * ```
 */
type SmallInt<
  T extends '!=0' | '' | '<=0' | '<0' | '>=0' | '>0' = '',
  MaxIndex extends number = TSTypeForgeInternals.SmallIntIndexMax,
> =
  TypeEq<T, '<=0'> extends true
    ? TSTypeForgeInternals.SmallNegativeInt<MaxIndex> | 0
    : TypeEq<T, '<0'> extends true
      ? TSTypeForgeInternals.SmallNegativeInt<MaxIndex>
      : TypeEq<T, '>=0'> extends true
        ? TSTypeForgeInternals.SmallPositiveInt<MaxIndex> | 0
        : TypeEq<T, '>0'> extends true
          ? TSTypeForgeInternals.SmallPositiveInt<MaxIndex>
          : TypeEq<T, '!=0'> extends true
            ?
                | TSTypeForgeInternals.SmallNegativeInt<MaxIndex>
                | TSTypeForgeInternals.SmallPositiveInt<MaxIndex>
            : TypeEq<T, ''> extends true
              ?
                  | TSTypeForgeInternals.SmallNegativeInt<MaxIndex>
                  | TSTypeForgeInternals.SmallPositiveInt<MaxIndex>
                  | 0
              : never;

/**
 * Union type of small non-negative integer literals.
 * Convenience type for `SmallInt<'>=0'>`.
 *
 * @example
 * ```ts
 * type Index = SmallUint; // 0 | 1 | 2 | ... | 39
 * const getItem = <T>(arr: readonly T[], i: Index) => arr[i];
 * ```
 */
type SmallUint = SmallInt<'>=0'>;

/**
 * Enhances an integer brand type with literal values for small integers.
 * This enables more precise typing for small integer values while maintaining
 * the brand for larger values.
 *
 * @template N - The integer brand type to enhance
 * @template MaxIndex - Maximum absolute value for literals (default: 40)
 * @returns Union of literal integers and the branded type
 *
 * @example
 * ```ts
 * type Count = WithSmallInt<Uint>;
 * // Count is 0 | 1 | 2 | ... | 39 | Uint
 *
 * const increment = (n: Count): Count => {
 *   if (typeof n === 'number' && n < 39) {
 *     return (n + 1) as Count; // Type narrowing works with literals
 *   }
 *   return (n as number + 1) as Count;
 * };
 *
 * // Common patterns:
 * type SmallInt = WithSmallInt<Int>;              // -40 to 39 | Int
 * type SmallUint = WithSmallInt<Uint>;            // 0 to 39 | Uint
 * type SmallPositiveInt = WithSmallInt<PositiveInt>; // 1 to 39 | PositiveInt
 * ```
 */
type WithSmallInt<
  N extends Int,
  MaxIndex extends number = TSTypeForgeInternals.SmallIntIndexMax,
> = TSTypeForgeInternals.WithSmallIntImpl<
  TSTypeForgeInternals.CastToInt<NormalizeBrandUnion<N>>,
  MaxIndex
>;

/**
 * Removes small integer literals from an integer type enhanced with WithSmallInt.
 * Useful for converting back to pure branded types.
 *
 * @template N - Integer type with small literals to remove from
 * @template MaxIndex - Maximum absolute value of literals to remove (default: 40)
 * @returns The branded type without literal values
 *
 * @example
 * ```ts
 * type Count = WithSmallInt<Uint>; // 0 | 1 | ... | 39 | Uint
 * type PureCount = RemoveSmallInt<Count>; // Uint
 *
 * const toLargeCount = (n: Count): RemoveSmallInt<Count> => {
 *   if (typeof n === 'number') {
 *     return (n + 1000) as Uint; // Convert small to large
 *   }
 *   return n;
 * };
 * ```
 */
type ExcludeSmallInt<
  N extends IntWithSmallInt,
  MaxIndex extends number = TSTypeForgeInternals.SmallIntIndexMax,
> = RelaxedExclude<N, SmallInt<'', MaxIndex>>;

declare namespace TSTypeForgeInternals {
  type SmallIntIndexMax = 40;

  /** Integers in `[1, MaxIndex - 1]` */
  type SmallPositiveInt<MaxIndex extends number = SmallIntIndexMax> =
    RelaxedExclude<Index<MaxIndex>, 0>;

  /** Integers in `[-MaxIndex, -1]` */
  type SmallNegativeInt<MaxIndex extends number = SmallIntIndexMax> =
    NegativeIndex<MaxIndex>;

  type WithSmallIntImpl<N extends Int, MaxIndex extends number> =
    | Exclude<
        SmallInt<'', MaxIndex>,
        | (N extends NegativeNumber ? SmallInt<'>=0', MaxIndex> : never)
        | (N extends NonNegativeNumber ? SmallInt<'<0', MaxIndex> : never)
        | (N extends NonZeroNumber ? 0 : never)
      >
    | N;

  /**
   * Utility type that filters only integer branded types.
   * Returns the input type if it extends Int, otherwise returns never.
   *
   * @template T - Type to check and cast
   * @returns T if T extends Int, otherwise never
   *
   * @example
   * ```ts
   * type A = CastToInt<Int>; // Int
   * type B = CastToInt<FiniteNumber>; // never
   * type C = CastToInt<SafeInt>; // SafeInt (since SafeInt extends Int)
   * ```
   */
  type CastToInt<T> = T extends Int ? T : never;
}
