type ToNumber<S extends `${number}`> = S extends `${infer N extends number}`
  ? N
  : never;

// type ToNumber<S extends `${number}`> =
//   _ToNumberInternals._IsSmallNumber<S> extends true
//     ? _MakeTupleInternals.MakeTupleImpl<unknown, S>['length']
//     : S;

// namespace _ToNumberInternals {
//   // config
//   type _DigitUpperLimit = 4;

//   type _IsSmallNumber<S extends `${number}`> = _IsSmallNumberImpl<
//     S,
//     MakeTuple<unknown, _DigitUpperLimit>
//   >;

//   type _Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

//   type _Tail<T extends string> = T extends `${_Digit}${infer U}` ? U : never;

//   type _IsSmallNumberImpl<
//     S extends string,
//     Counter extends readonly unknown[]
//   > = S extends ''
//     ? true
//     : TypeEq<Counter, readonly []> extends true
//     ? false // reached the limit
//     : _IsSmallNumberImpl<_Tail<S>, Tuple.Tail<Counter>>;
// }
