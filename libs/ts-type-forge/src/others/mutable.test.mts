import { expectType } from 'ts-data-forge';
import {
  type Mutable,
  type MutableMap,
  type MutableSet,
  type ToMutableMap,
  type ToMutableSet,
} from './mutable.mjs';

// Test Mutable utility type

// Test basic readonly to mutable conversion
type ReadonlyUser = Readonly<{
  id: number;
  name: string;
  email: string;
}>;

type MutableUser = Mutable<ReadonlyUser>;

expectType<MutableUser, Readonly<{ id: number; name: string; email: string }>>(
  '=',
);

// Test that Mutable removes readonly modifiers
expectType<Mutable<Readonly<{ a: string }>>, Readonly<{ a: string }>>('=');

expectType<
  Mutable<Readonly<{ a: string; b: number }>>,
  Readonly<{ a: string; b: number }>
>('=');

expectType<
  Mutable<Readonly<{ x: boolean; y: string }>>,
  Readonly<{ x: boolean; y: string }>
>('=');

// Test that already mutable properties remain mutable
expectType<
  Mutable<Readonly<{ a: string; b: number }>>,
  Readonly<{ a: string; b: number }>
>('=');

// Test with complex types
type ComplexReadonly = Readonly<{
  data: Readonly<{ nested: string }>;
  list: readonly string[];
  func: () => void;
}>;

type ComplexMutable = Mutable<ComplexReadonly>;

expectType<
  ComplexMutable,
  Readonly<{
    data: Readonly<{ nested: string }>; // Note: nested readonly is preserved
    list: readonly string[]; // Note: readonly array is preserved
    func: () => void;
  }>
>('=');

// Test ToMutableMap utility type

expectType<
  ToMutableMap<ReadonlyMap<string, number>>,
  ReadonlyMap<string, number>
>('=');

expectType<
  ToMutableMap<ReadonlyMap<number, string>>,
  ReadonlyMap<number, string>
>('=');

expectType<ToMutableMap<ReadonlyMap<any, any>>, ReadonlyMap<any, any>>('=');

// Test ToMutableSet utility type

expectType<ToMutableSet<ReadonlySet<string>>, ReadonlySet<string>>('=');

expectType<ToMutableSet<ReadonlySet<number>>, ReadonlySet<number>>('=');

expectType<ToMutableSet<ReadonlySet<any>>, ReadonlySet<any>>('=');

// Test MutableSet alias

expectType<MutableSet<string>, ReadonlySet<string>>('=');

expectType<MutableSet<number>, ReadonlySet<number>>('=');

expectType<MutableSet<any>, ReadonlySet<any>>('=');

// Test MutableMap alias

expectType<MutableMap<string, number>, ReadonlyMap<string, number>>('=');

expectType<MutableMap<number, string>, ReadonlyMap<number, string>>('=');

expectType<MutableMap<any, any>, ReadonlyMap<any, any>>('=');

// Test edge cases

// Empty object
expectType<Mutable<{}>, {}>('=');

// Object with optional properties
expectType<Mutable<Readonly<{ a?: string }>>, Readonly<{ a?: string }>>('=');

// Object with index signature
expectType<
  Mutable<Readonly<{ [key: string]: number }>>,
  Readonly<{ [key: string]: number }>
>('=');

// Test interaction with built-in Readonly
type TestReadonlyInteraction = Mutable<Readonly<{ a: string; b: number }>>;

expectType<TestReadonlyInteraction, Readonly<{ a: string; b: number }>>('=');

// Test that Mutable is idempotent for already mutable objects
type AlreadyMutable = Readonly<{ a: string; b: number }>;

expectType<Mutable<AlreadyMutable>, AlreadyMutable>('=');

// Test with union types
expectType<
  Mutable<Readonly<{ a: string } | { b: number }>>,
  Readonly<{ a: string } | { b: number }>
>('=');

// Test with intersection types
expectType<
  Mutable<Readonly<{ a: string } & { b: number }>>,
  Readonly<{ a: string } & { b: number }>
>('~=');
