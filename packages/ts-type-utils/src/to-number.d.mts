type ToNumber<S extends `${number}`> = S extends `${infer N extends number}`
  ? N
  : never;

/* TypeScript v4.8 以前では以下の実装が必要 */

// type ToNumber<S extends `${number}`> =
//   TSTypeUtilsInternals._IsSmallNumber<S> extends true
//     ? TSTypeUtilsInternals.MakeTupleInternals.MakeTupleImpl<
//         unknown,
//         S,
//         []
//       >['length']
//     : S;

// declare namespace TSTypeUtilsInternals {
//   // config
//   type DigitUpperLimit = 4;

//   type IsSmallNumber<S extends `${number}`> = IsSmallNumberImpl<
//     S,
//     MakeTuple<unknown, DigitUpperLimit>
//   >;

//   type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

//   type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;

//   type IsSmallNumberImpl<
//     S extends string,
//     Counter extends readonly unknown[],
//   > = S extends ''
//     ? true
//     : TypeEq<Counter, readonly []> extends true
//       ? false // reached the limit
//       : IsSmallNumberImpl<Tail<S>, Tuple.Tail<Counter>>;
// }
