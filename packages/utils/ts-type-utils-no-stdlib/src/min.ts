import { type Uint10 } from './enum';
import { type IsNever } from './is-never';

export type Min<N extends Uint10> = _MinImpl<N, []>;

type _MinImpl<
  N extends Uint10,
  T extends readonly unknown[],
> = IsNever<N> extends true
  ? never
  : T['length'] extends N
  ? T['length']
  : _MinImpl<N, [0, ...T]>;

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
