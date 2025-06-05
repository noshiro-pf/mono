import { expectType } from '../expect-type.mjs';

// Test that all primitive types are part of Primitive
expectType<bigint, Primitive>('<=');
expectType<boolean, Primitive>('<=');
expectType<number, Primitive>('<=');
expectType<string, Primitive>('<=');
expectType<symbol, Primitive>('<=');
expectType<null, Primitive>('<=');
expectType<undefined, Primitive>('<=');

// Test specific primitive values
expectType<42, Primitive>('<=');
expectType<'hello', Primitive>('<=');
expectType<true, Primitive>('<=');
expectType<false, Primitive>('<=');
expectType<1n, Primitive>('<=');
expectType<0n, Primitive>('<=');

// Test that non-primitive types are not part of Primitive
expectType<{}, Primitive>('!<=');
expectType<[], Primitive>('!<=');
expectType<object, Primitive>('!<=');
expectType<() => void, Primitive>('!<='); // function type
expectType<Date, Primitive>('!<=');
expectType<RegExp, Primitive>('!<=');
expectType<Error, Primitive>('!<=');
expectType<Map<any, any>, Primitive>('!<=');
expectType<Set<any>, Primitive>('!<=');

// Test the exact type composition
expectType<
  Primitive,
  bigint | boolean | number | string | symbol | null | undefined
>('=');

// Test conditional types using Primitive
type IsPrimitive<T> = T extends Primitive ? true : false;

expectType<IsPrimitive<number>, true>('=');
expectType<IsPrimitive<string>, true>('=');
expectType<IsPrimitive<boolean>, true>('=');
expectType<IsPrimitive<bigint>, true>('=');
expectType<IsPrimitive<symbol>, true>('=');
expectType<IsPrimitive<null>, true>('=');
expectType<IsPrimitive<undefined>, true>('=');

expectType<IsPrimitive<{}>, false>('=');
expectType<IsPrimitive<[]>, false>('=');
expectType<IsPrimitive<object>, false>('=');
expectType<IsPrimitive<() => void>, false>('='); // function type

// Test filtering primitives from union types
type OnlyPrimitives<T> = T extends Primitive ? T : never;

expectType<OnlyPrimitives<string | object>, string>('=');
expectType<OnlyPrimitives<number | {} | boolean>, number | boolean>('=');
expectType<OnlyPrimitives<Date | string | (() => void) | null>, string | null>(
  '=',
);

// Test excluding primitives from union types
type OnlyObjects<T> = T extends Primitive ? never : T;

expectType<OnlyObjects<string | object>, object>('=');
expectType<OnlyObjects<number | {} | boolean>, {}>('=');
expectType<
  OnlyObjects<Date | string | (() => void) | null>,
  Date | (() => void)
>('=');

// Test interaction with unknown and any
expectType<unknown, Primitive>('!<=');
expectType<Primitive, unknown>('<=');
expectType<any, Primitive>('~='); // any is both assignable to and from Primitive
