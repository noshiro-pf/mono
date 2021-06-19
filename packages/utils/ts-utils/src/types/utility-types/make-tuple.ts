import type { TypeEq } from './test-type';
import { assertType } from './test-type';

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;
type First<T extends string> = T extends `${infer U}${Tail<T>}` ? U : never;

type DigitStr = `${Digit}`;

type Tile<
  T extends readonly unknown[],
  N extends Digit | DigitStr | '10' | 10
> = [
  readonly [],
  readonly [...T],
  readonly [...T, ...T],
  readonly [...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
  readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T]
][N];

export type MakeTupleImpl<
  T,
  N extends string,
  X extends readonly unknown[] = []
> = string extends N
  ? never
  : N extends ''
  ? X
  : First<N> extends infer U
  ? U extends DigitStr
    ? MakeTupleImpl<T, Tail<N>, readonly [...Tile<[T], U>, ...Tile<X, 10>]>
    : never
  : never;

export type MakeTuple<T, N extends number> = MakeTupleImpl<T, `${N}`>;

assertType<
  TypeEq<MakeTuple<unknown, 3>, readonly [unknown, unknown, unknown]>
>();
