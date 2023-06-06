import { type Uint10 } from './enum';
import { type IsNever } from './is-never';

export type Max<N extends Uint10> = _MaxImpl<N, []>;

type _MaxImpl<
  N extends Uint10,
  T extends readonly unknown[]
> = IsNever<N> extends true
  ? never
  : [N] extends [Partial<T>['length']]
  ? T['length']
  : _MaxImpl<N, [0, ...T]>;

// /** @internal */
// namespace _MaxImpl {
//   /**
//    * LEQ[3 | 5] == 0 | 1 | 2 | 3 | 4 | 5;
//    */
//   type LEQ = {
//     [N in Index<64>]: IndexOfTuple<[0, ...MakeTuple<0, N>]>;
//   };

//   /**
//    * @returns Y if A == B otherwise N
//    */
//   type Eq<A, B, Y, N> = [A] extends [B] ? ([B] extends [A] ? Y : N) : N;

//   /**
//    * The former part
//    *
//    * ```ts
//    * type Main<
//    *   N extends number,
//    *   U extends number = ToLEQ<Extract<N, keyof LEQ>>
//    * > = {
//    *   [K in keyof LEQ]: Eq<U, LEQ[K], K, never>;
//    * }
//    * ```
//    *
//    * behaves like this
//    *
//    * ```ts
//    * type R = {
//    *   0: never;
//    *   1: never;
//    *   2: never;
//    *   3: never;
//    *   4: never;
//    *   5: 5;
//    *   6: never;
//    *   ...
//    * }
//    * ```
//    */
//   export type Main<
//     N extends number,
//     U extends number = LEQ[Extract<N, keyof LEQ>]
//   > = {
//     [K in keyof LEQ]: Eq<U, LEQ[K], K, never>;
//   }[keyof LEQ];
// }

// export type Max<N extends Uint10> = _MaxImpl.Main<N>;

// /** @internal */
// type _MaxImpl<N extends Index<64>, T extends readonly unknown[]> = {
//   b: T['length'];
//   r: _MaxImpl<N, [0, ...T]>;
// }[[N] extends [Partial<T>['length']] ? 'b' : 'r'];

// export type Max<N extends Index<64>> = _MaxImpl<N, []>;

// https://stackoverflow.com/questions/62968955/how-to-implement-a-type-level-max-function-over-a-union-of-literals-in-typescri
