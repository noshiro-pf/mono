import { expectType } from 'ts-data-forge';
import { type IsUnion } from './is-union.mjs';

expectType<IsUnion<never>, false>('=');

expectType<IsUnion<unknown>, false>('=');

expectType<IsUnion<any>, false>('=');

expectType<IsUnion<string>, false>('=');

expectType<IsUnion<true | false>, true>('=');

expectType<IsUnion<boolean>, true>('=');

expectType<IsUnion<number | string>, true>('=');

expectType<IsUnion<readonly [number | string]>, false>('=');

expectType<IsUnion<Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 }>>, true>('=');

expectType<IsUnion<Record<number, number> | Record<string, number>>, true>('=');

expectType<
  IsUnion<
    Readonly<{ a: 0 } | { a: 1; b: 1 } | { b: 2 }> | Record<string, number>
  >,
  true
>('=');
