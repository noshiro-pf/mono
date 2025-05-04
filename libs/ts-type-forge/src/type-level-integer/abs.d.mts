/**
 * Calculates the absolute value of a number literal type `N`.
 * If `N` is a negative number literal, it returns its positive counterpart.
 * If `N` is a non-negative number literal, it returns `N` itself.
 * Handles distribution over union types.
 *
 * @template N - The number literal type.
 * @returns The absolute value of `N` as a number literal type.
 * @example
 * type Pos = AbsoluteValue<10>;  // 10
 * type Neg = AbsoluteValue<-5>; // 5
 * type Zero = AbsoluteValue<0>;  // 0
 * type Union = AbsoluteValue<-1 | 2>; // 1 | 2
 */
type AbsoluteValue<N extends number> = N extends N
  ? `${N}` extends `-${infer P}`
    ? P extends `${number}`
      ? ToNumber<P>
      : never
    : N
  : never;

/**
 * Shorter alias for `AbsoluteValue<N>`.
 * Calculates the absolute value of a number literal type `N`.
 * @template N - The number literal type.
 * @returns The absolute value of `N` as a number literal type.
 * @example
 * type Pos = Abs<10>;  // 10
 * type Neg = Abs<-5>; // 5
 */
type Abs<N extends number> = AbsoluteValue<N>;
