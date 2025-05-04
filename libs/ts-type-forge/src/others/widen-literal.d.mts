/**
 * Widens a literal type `T` to its corresponding primitive type.
 * If `T` is not a literal type, it returns `T` unchanged.
 *
 * @template T - The type to potentially widen.
 * @returns The widened primitive type if `T` is a literal, otherwise `T`.
 *
 * @example
 * type Str = WidenLiteral<"hello">; // string
 * type Num = WidenLiteral<123>; // number
 * type Bool = WidenLiteral<true>; // boolean
 * type Big = WidenLiteral<100n>; // bigint
 * type Sym = WidenLiteral<typeof Symbol.iterator>; // symbol
 * type Obj = WidenLiteral<{ a: number }>; // { a: number } (unchanged)
 * type Union = WidenLiteral<"a" | 1>; // string | number
 */
type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T extends symbol
          ? symbol
          : T;
