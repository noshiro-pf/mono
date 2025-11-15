import { expectType } from '../expect-type.mjs';

// Test WidenLiteral utility type

// Test basic literal widening for primitives
expectType<WidenLiteral<'hello'>, string>('=');

expectType<WidenLiteral<'a'>, string>('=');

expectType<WidenLiteral<''>, string>('=');

expectType<WidenLiteral<123>, number>('=');

expectType<WidenLiteral<0>, number>('=');

expectType<WidenLiteral<-42>, number>('=');

expectType<WidenLiteral<3.14>, number>('=');

expectType<WidenLiteral<true>, boolean>('=');

expectType<WidenLiteral<false>, boolean>('=');

expectType<WidenLiteral<100n>, bigint>('=');

expectType<WidenLiteral<0n>, bigint>('=');

expectType<WidenLiteral<-50n>, bigint>('=');

// Test with symbol
declare const _sym: unique symbol;

expectType<WidenLiteral<typeof _sym>, symbol>('=');

expectType<WidenLiteral<typeof Symbol.iterator>, symbol>('=');

// Test that non-primitives remain unchanged
expectType<WidenLiteral<{ a: number }>, { a: number }>('=');

expectType<WidenLiteral<[1, 2, 3]>, [1, 2, 3]>('=');

expectType<WidenLiteral<readonly [1, 2, 3]>, readonly [1, 2, 3]>('=');

expectType<WidenLiteral<() => void>, () => void>('=');

expectType<WidenLiteral<undefined>, undefined>('=');

expectType<WidenLiteral<null>, null>('=');

// Test with union types (distributive)
expectType<WidenLiteral<'a' | 'b'>, string>('=');

expectType<WidenLiteral<1 | 2 | 3>, number>('=');

expectType<WidenLiteral<true | false>, boolean>('=');

expectType<WidenLiteral<'a' | 1 | true>, string | number | boolean>('=');

expectType<
  WidenLiteral<'hello' | 123 | false | 10n>,
  string | number | boolean | bigint
>('=');

// Test with template literal types
expectType<WidenLiteral<`hello`>, string>('=');

expectType<WidenLiteral<`hello ${string}`>, string>('='); // Template literals with placeholders widen to string

// Test with literal types that are already their primitive type
expectType<WidenLiteral<string>, string>('=');

expectType<WidenLiteral<number>, number>('=');

expectType<WidenLiteral<boolean>, boolean>('=');

expectType<WidenLiteral<bigint>, bigint>('=');

expectType<WidenLiteral<symbol>, symbol>('=');

// Test practical use case: API compatibility
type LiteralConfig = {
  method: 'GET' | 'POST';
  timeout: 5000;
  enabled: true;
};

type WidenedConfig = {
  [K in keyof LiteralConfig]: WidenLiteral<LiteralConfig[K]>;
};

expectType<
  WidenedConfig,
  { method: string; timeout: number; enabled: boolean }
>('=');

// Test with const assertions
type ConstArray = WidenLiteral<readonly ['a', 1, true]>;

expectType<ConstArray, readonly ['a', 1, true]>('='); // Arrays don't widen

type ConstObject = WidenLiteral<Readonly<{ x: 'hello'; y: 123 }>>;

expectType<ConstObject, Readonly<{ x: 'hello'; y: 123 }>>('='); // Objects don't widen

// Test with never and unknown
expectType<WidenLiteral<never>, never>('=');

expectType<WidenLiteral<unknown>, unknown>('=');

// Test with any
expectType<WidenLiteral<any>, any>('=');

// Test with mixed unions including non-literals
expectType<WidenLiteral<'a' | string>, string>('=');

expectType<WidenLiteral<1 | number>, number>('=');

expectType<WidenLiteral<true | boolean>, boolean>('=');

expectType<WidenLiteral<'a' | { x: 1 }>, string | { x: 1 }>('=');

// Test with intersection types
expectType<WidenLiteral<'hello' & string>, string>('=');

expectType<WidenLiteral<123 & number>, number>('=');

// Test edge case: literal union that covers all possible values
expectType<WidenLiteral<true | false>, boolean>('=');

// Test with enum-like patterns
type Direction = 'north' | 'south' | 'east' | 'west';

expectType<WidenLiteral<Direction>, string>('=');

type Status = 0 | 1 | 2;

expectType<WidenLiteral<Status>, number>('=');

// Test that it preserves structure for complex types
type ComplexType = {
  literal: 'hello';
  nested: {
    value: 42;
    flag: true;
  };
  array: readonly [1, 2, 3];
};

expectType<WidenLiteral<ComplexType>, ComplexType>('=');

// Test with mapped types over literals
type MappedLiterals = {
  [K in 'a' | 'b' | 'c']: K;
};

type WidenedMapped = {
  [K in keyof MappedLiterals]: WidenLiteral<MappedLiterals[K]>;
};

expectType<WidenedMapped, { a: string; b: string; c: string }>('=');
