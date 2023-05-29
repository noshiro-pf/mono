import { type Index } from './index-type';
import { type IsNever } from './is-never';

type _MinImpl<
  N extends number,
  T extends readonly unknown[]
> = IsNever<N> extends true
  ? never
  : T['length'] extends N
  ? T['length']
  : _MinImpl<N, [0, ...T]>;

export type Min<N extends Index<512>> = _MinImpl<N, []>;

// /** @internal */
// type _MinImpl<
//   N extends Index<64>,
//   Count extends number
// > = IsNever<N> extends true
//   ? never
//   : 0 extends N
//   ? Count
//   : _MinImpl<Decrement<N>, Increment<Count> & number>;

// export type Min<N extends Index<64>> = _MinImpl<N, 0>;
