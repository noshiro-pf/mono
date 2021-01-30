import { assertType, TypeEq } from '../test-type';
import { Rest } from './rest';
import { Zip } from './zip';

export type ShiftZip<T extends unknown[]> = Zip<T, Rest<T>>;
assertType<TypeEq<ShiftZip<[1, 2, 3]>, [[1, 2], [2, 3]]>>();

export type Tuple2Fn<T> = T extends [infer A, infer B] ? (x: A) => B : never;
assertType<TypeEq<Tuple2Fn<[1, 2]>, (x: 1) => 2>>();

export type _Pipe<T extends unknown[]> = { [P in keyof T]: Tuple2Fn<T[P]> };
assertType<TypeEq<_Pipe<[[1, 2], [2, 3]]>, [(x: 1) => 2, (x: 2) => 3]>>();

export type Cast<T, P> = T extends P ? T : P;
// export type Pipe<T extends unknown[]> = _Pipe<
//   ShiftZip<T> extends infer A ? Cast<A, unknown[]> : never
// >;
// assertType<TypeEq<Pipe<[1, 2, 3]>, [(x: 1) => 2, (x: 2) => 3]>>();

// export type Cast<T, P> = T extends P ? T : P;
// export type Pipe<T extends unknown[]> = _Pipe<Cast<ShiftZip<T>, unknown[]>>;

// export type PipeFunc<T extends [unknown, unknown, ...unknown[]]> = (
//   ...f: Cast<Pipe<T>, unknown[]>
// ) => (x: First<T>) => Last<T>;

// export const pipe = (<A>(
//   x: unknown,
//   ...fns: ((v: unknown) => unknown)[]
// ): unknown => fns.reduce((acc, fn) => fn(acc), x)) as PipeFunc<A>;

// https://qiita.com/kgtkr/items/11c8dceae012ae306abe#%E5%AE%9F%E8%B7%B5%E7%B7%A8pipe%E9%96%A2%E6%95%B0%E3%81%AB%E5%9E%8B%E4%BB%98%E3%81%91%E3%82%92%E3%81%97%E3%82%88%E3%81%86
