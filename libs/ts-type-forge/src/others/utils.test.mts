import { expectType } from 'ts-data-forge';
import {
  type Intersection,
  type Length,
  type MergeIntersection,
  type ToNumber,
  type UnionToIntersection,
} from './utils.mjs';

expectType<ToNumber<'1000'>, 1000>('=');

expectType<ToNumber<'8192'>, 8192>('=');

expectType<ToNumber<'9999'>, 9999>('=');

expectType<ToNumber<'10000'>, 10_000>('=');

expectType<Length<readonly [1, 2, 3]>, 3>('=');

expectType<Length<'aaa'>, number>('=');

expectType<UnionToIntersection<1 | 2 | 3>, never>('=');

expectType<UnionToIntersection<1 | 1>, 1>('=');

expectType<
  UnionToIntersection<Readonly<{ a: 0 } | { b: 1 }>>,
  Readonly<{ a: 0 } & { b: 1 }>
>('=');

expectType<
  UnionToIntersection<Readonly<{ x: 0; y: 1 } | { x: 0; y: 2 }>>,
  never
>('=');

expectType<
  UnionToIntersection<Readonly<{ x: 0; y: 1 } | { x: 0; z: 2 }>>,
  Readonly<{ x: 0; y: 1 } & { x: 0; z: 2 }>
>('=');

expectType<
  MergeIntersection<
    UnionToIntersection<Readonly<{ x: 0; y: 1 } | { x: 0; z: 2 }>>
  >,
  Readonly<{ x: 0; y: 1; z: 2 }>
>('=');

// Intersection type tests
expectType<Intersection<readonly []>, unknown>('=');

expectType<Intersection<readonly [string]>, string>('=');

expectType<Intersection<readonly [string, number]>, string & number>('=');

expectType<
  Intersection<readonly [string, number, boolean]>,
  string & number & boolean
>('=');

expectType<
  Intersection<readonly [Readonly<{ a: 1 }>, Readonly<{ b: 2 }>]>,
  Readonly<{ a: 1; b: 2 }>
>('=');

expectType<
  Intersection<
    readonly [Readonly<{ a: 1 }>, Readonly<{ b: 2 }>, Readonly<{ c: 3 }>]
  >,
  Readonly<{ a: 1; b: 2; c: 3 }>
>('=');

expectType<
  Intersection<
    readonly [
      Readonly<{ x: number }>,
      Readonly<{ y: string }>,
      Readonly<{ z: boolean }>,
    ]
  >,
  Readonly<{ x: number; y: string; z: boolean }>
>('=');

expectType<
  Intersection<readonly [Readonly<{ a: 1; b: 2 }>, Readonly<{ b: 2; c: 3 }>]>,
  Readonly<{ a: 1; b: 2; c: 3 }>
>('=');

expectType<
  Intersection<readonly [Readonly<{ a: 1; b: 2 }>, Readonly<{ b: 3; c: 3 }>]>,
  never
>('=');

// Mixed types intersection
expectType<
  Intersection<
    readonly [Readonly<{ name: string }>, Readonly<{ age: number }>]
  >,
  Readonly<{ name: string; age: number }>
>('=');

// Single record type
expectType<
  Intersection<readonly [Readonly<{ x: number; y: string }>]>,
  Readonly<{ x: number; y: string }>
>('=');
