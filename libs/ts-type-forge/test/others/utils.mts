import { expectType } from '../expect-type.mjs';

expectType<ToNumber<'1000'>, 1000>('=');
expectType<ToNumber<'8192'>, 8192>('=');
expectType<ToNumber<'9999'>, 9999>('=');
expectType<ToNumber<'10000'>, 10_000>('=');

expectType<Length<readonly [1, 2, 3]>, 3>('=');
expectType<Length<'aaa'>, number>('=');

expectType<UnionToIntersection<1 | 2 | 3>, never>('=');

expectType<UnionToIntersection<1 | 1>, 1>('=');
expectType<UnionToIntersection<{ a: 0 } | { b: 1 }>, { a: 0 } & { b: 1 }>('=');
expectType<UnionToIntersection<{ x: 0; y: 1 } | { x: 0; y: 2 }>, never>('=');

expectType<
  UnionToIntersection<{ x: 0; y: 1 } | { x: 0; z: 2 }>,
  { x: 0; y: 1 } & { x: 0; z: 2 }
>('=');

expectType<
  MergeIntersection<UnionToIntersection<{ x: 0; y: 1 } | { x: 0; z: 2 }>>,
  { x: 0; y: 1; z: 2 }
>('=');
