import { expectType } from './expect-type.mjs';

expectType<IsNever<never>, true>('=');
expectType<IsNever<string>, false>('=');
expectType<IsNever<number | string>, false>('=');
expectType<IsNever<[number | string]>, false>('=');
