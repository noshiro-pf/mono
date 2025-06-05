import { expectType } from '../expect-type.mjs';

// Test Mutable utility type

// Test basic readonly to mutable conversion
type ReadonlyUser = {
  readonly id: number;
  readonly name: string;
  readonly email: string;
};

type MutableUser = Mutable<ReadonlyUser>;

expectType<MutableUser, { id: number; name: string; email: string }>('=');

// Test that Mutable removes readonly modifiers
expectType<Mutable<{ readonly a: string }>, { a: string }>('=');
expectType<
  Mutable<{ readonly a: string; b: number }>,
  { a: string; b: number }
>('=');
expectType<
  Mutable<Readonly<{ x: boolean; y: string }>>,
  { x: boolean; y: string }
>('=');

// Test that already mutable properties remain mutable
expectType<Mutable<{ a: string; b: number }>, { a: string; b: number }>('=');

// Test with complex types
type ComplexReadonly = {
  readonly data: { readonly nested: string };
  readonly list: readonly string[];
  readonly func: () => void;
};

type ComplexMutable = Mutable<ComplexReadonly>;

expectType<
  ComplexMutable,
  {
    data: { readonly nested: string }; // Note: nested readonly is preserved
    list: readonly string[]; // Note: readonly array is preserved
    func: () => void;
  }
>('=');

// Test ToMutableMap utility type

expectType<ToMutableMap<ReadonlyMap<string, number>>, Map<string, number>>('=');
expectType<ToMutableMap<ReadonlyMap<number, string>>, Map<number, string>>('=');
expectType<ToMutableMap<ReadonlyMap<any, any>>, Map<any, any>>('=');

// Test ToMutableSet utility type

expectType<ToMutableSet<ReadonlySet<string>>, Set<string>>('=');
expectType<ToMutableSet<ReadonlySet<number>>, Set<number>>('=');
expectType<ToMutableSet<ReadonlySet<any>>, Set<any>>('=');

// Test MutableSet alias

expectType<MutableSet<string>, Set<string>>('=');
expectType<MutableSet<number>, Set<number>>('=');
expectType<MutableSet<any>, Set<any>>('=');

// Test MutableMap alias

expectType<MutableMap<string, number>, Map<string, number>>('=');
expectType<MutableMap<number, string>, Map<number, string>>('=');
expectType<MutableMap<any, any>, Map<any, any>>('=');

// Test edge cases

// Empty object
expectType<Mutable<{}>, {}>('=');

// Object with optional properties
expectType<Mutable<{ readonly a?: string }>, { a?: string }>('=');

// Object with index signature
expectType<
  Mutable<{ readonly [key: string]: number }>,
  { [key: string]: number }
>('=');

// Test interaction with built-in Readonly
type TestReadonlyInteraction = Mutable<Readonly<{ a: string; b: number }>>;
expectType<TestReadonlyInteraction, { a: string; b: number }>('=');

// Test that Mutable is idempotent for already mutable objects
type AlreadyMutable = { a: string; b: number };
expectType<Mutable<AlreadyMutable>, AlreadyMutable>('=');

// Test with union types
expectType<
  Mutable<{ readonly a: string } | { readonly b: number }>,
  { a: string } | { b: number }
>('=');

// Test with intersection types
expectType<
  Mutable<{ readonly a: string } & { readonly b: number }>,
  { a: string } & { b: number }
>('~=');
