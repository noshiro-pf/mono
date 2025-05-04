import { expectType } from '../expect-type.mjs';

expectType<TypeExtends<string, string | number>, true>('=');
expectType<TypeExtends<string | number, string>, false>('=');
expectType<TypeExtends<'a', string>, true>('=');
expectType<TypeExtends<string, 'a'>, false>('=');
expectType<TypeExtends<{ a: number }, object>, true>('=');
expectType<TypeExtends<never, string>, true>('=');
expectType<TypeExtends<string, any>, true>('=');
expectType<TypeExtends<any, string>, true>('=');
expectType<TypeExtends<string, unknown>, true>('=');
expectType<TypeExtends<unknown, string>, false>('=');
