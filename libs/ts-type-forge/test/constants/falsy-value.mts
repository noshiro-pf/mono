import { expectType } from '../expect-type.mjs';

// Test that all expected falsy values are part of FalsyValue
expectType<false, FalsyValue>('<=');

expectType<0, FalsyValue>('<=');

expectType<-0, FalsyValue>('<=');

expectType<'', FalsyValue>('<=');

expectType<null, FalsyValue>('<=');

expectType<undefined, FalsyValue>('<=');

expectType<0n, FalsyValue>('<=');

// Test that truthy values are not part of FalsyValue
expectType<true, FalsyValue>('!<=');

expectType<1, FalsyValue>('!<=');

expectType<'hello', FalsyValue>('!<=');

expectType<{}, FalsyValue>('!<=');

expectType<[], FalsyValue>('!<=');

expectType<42, FalsyValue>('!<=');

expectType<'0', FalsyValue>('!<=');

expectType<1n, FalsyValue>('!<=');

// Test the exact type composition
expectType<FalsyValue, -0 | '' | 0 | 0n | false | null | undefined>('=');

// Test conditional types using FalsyValue
type IsFalsy<T> = T extends FalsyValue ? true : false;

expectType<IsFalsy<false>, true>('=');

expectType<IsFalsy<0>, true>('=');

expectType<IsFalsy<''>, true>('=');

expectType<IsFalsy<null>, true>('=');

expectType<IsFalsy<undefined>, true>('=');

expectType<IsFalsy<0n>, true>('=');

expectType<IsFalsy<true>, false>('=');

expectType<IsFalsy<1>, false>('=');

expectType<IsFalsy<'hello'>, false>('=');

expectType<IsFalsy<{}>, false>('=');

expectType<IsFalsy<[]>, false>('=');

// Test exclusion from union types
type TruthyOnly<T> = Exclude<T, FalsyValue>;

expectType<TruthyOnly<boolean>, true>('=');

expectType<TruthyOnly<number>, Exclude<number, 0 | -0>>('=');

expectType<TruthyOnly<string>, Exclude<string, ''>>('=');

expectType<TruthyOnly<bigint>, Exclude<bigint, 0n>>('=');

// Test filtering out falsy values from union types
type TestUnion = 0 | 1 | '' | 'hello' | false | true | null | undefined;

type TruthyValues = Exclude<TestUnion, FalsyValue>;

expectType<TruthyValues, 1 | 'hello' | true>('=');
