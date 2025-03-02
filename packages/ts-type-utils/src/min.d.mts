type Min<N extends Uint10> = TSTypeUtilsInternals.MinImpl<N, []>;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type MinImpl<N extends Uint10, T extends readonly unknown[]> =
    IsNever<N> extends true
      ? never
      : T['length'] extends N
        ? T['length']
        : MinImpl<N, [0, ...T]>;
}

// type Min<N extends Index<64>> = _MinImpl<N, 0>;
//
// type MinImpl<N extends Index<64>, Count extends number> =
//   IsNever<N> extends true
//     ? never
//     : 0 extends N
//       ? Count
//       : _MinImpl<Decrement<N>, Increment<Count> & number>;
