/* eslint-disable import/no-unused-modules */
import { type MergeIntersection, type UnionToIntersection } from '../src';
import { expectType } from './expect-type';

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
