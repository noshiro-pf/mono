import { expectType } from './expect-type.mjs';

expectType<UnionToIntersection<1 | 2 | 3>, never>('=');
// eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
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
