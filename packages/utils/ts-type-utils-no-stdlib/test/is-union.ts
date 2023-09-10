import { type IsUnion } from '../src';
import { expectType } from './expect-type';

expectType<IsUnion<never>, false>('=');
expectType<IsUnion<string>, false>('=');
expectType<IsUnion<number | string>, true>('=');
expectType<IsUnion<[number | string]>, false>('=');

expectType<
  IsUnion<Readonly<{ a: 0 }> | Readonly<{ a: 1; b: 1 }> | Readonly<{ b: 2 }>>,
  true
>('=');

expectType<IsUnion<Record<number, number> | Record<string, number>>, true>('=');

expectType<
  IsUnion<
    | Readonly<{ a: 0 }>
    | Readonly<{ a: 1; b: 1 }>
    | Readonly<{ b: 2 }>
    | Record<string, number>
  >,
  true
>('=');
