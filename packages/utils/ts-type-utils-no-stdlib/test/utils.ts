import {
  type ArrayOfLength,
  type MergeIntersection,
  type MutableArrayOfLength,
  type UnionToIntersection,
} from '../src';
import { expectType } from './expect-type';

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

expectType<ArrayOfLength<0, 0>, readonly []>('=');
expectType<ArrayOfLength<3, 0>, readonly [0, 0, 0]>('=');
expectType<ArrayOfLength<4, 1>, readonly [1, 1, 1, 1]>('=');
expectType<MutableArrayOfLength<4, 1>, [1, 1, 1, 1]>('=');
