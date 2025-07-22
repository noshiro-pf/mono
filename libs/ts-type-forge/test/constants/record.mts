import { expectType } from '../expect-type.mjs';

// Test that UnknownRecord is properly defined
expectType<UnknownRecord, ReadonlyRecord<string, unknown>>('=');

// Test that UnknownRecord accepts various object structures
expectType<{ name: string; age: number }, UnknownRecord>('<=');
expectType<{ [key: string]: any }, UnknownRecord>('<=');
expectType<{ a: 1; b: 'hello'; c: true }, UnknownRecord>('<=');
expectType<{}, UnknownRecord>('<=');
expectType<Record<string, unknown>, UnknownRecord>('<=');

// Test that UnknownRecord rejects non-object types
expectType<string, UnknownRecord>('!=');
expectType<number, UnknownRecord>('!=');
expectType<boolean, UnknownRecord>('!=');
expectType<null, UnknownRecord>('!=');
expectType<undefined, UnknownRecord>('!=');
expectType<[], UnknownRecord>('!=');
expectType<() => void, UnknownRecord>('!='); // function type

// Test readonly behavior
type TestReadonly =
  UnknownRecord extends ReadonlyRecord<string, unknown> ? true : false;
expectType<TestReadonly, true>('=');

// Test that keys must be strings
expectType<Record<number, unknown>, UnknownRecord>('!=');
expectType<Record<symbol, unknown>, UnknownRecord>('!=');
expectType<Record<string | number, unknown>, UnknownRecord>('!=');

// Test that values can be any unknown type
expectType<Record<string, string>, UnknownRecord>('<=');
expectType<Record<string, number>, UnknownRecord>('<=');
expectType<Record<string, boolean>, UnknownRecord>('<=');
expectType<Record<string, object>, UnknownRecord>('<=');
expectType<Record<string, any>, UnknownRecord>('<=');
expectType<Record<string, never>, UnknownRecord>('<=');

// Test compatibility with specific object types
type TestConfig = Readonly<{
  apiUrl: string;
  timeout: number;
  retries: number;
}>;

// TestConfig can be used where UnknownRecord is expected with proper handling
expectType<TestConfig, UnknownRecord>('!='); // They're different but related types

// Test that UnknownRecord is safer than Record<string, any>
type IsUnknownSafer = Record<string, any> extends UnknownRecord ? true : false;
expectType<IsUnknownSafer, true>('=');

type IsUnknownStricter =
  UnknownRecord extends Record<string, any> ? true : false;
expectType<IsUnknownStricter, true>('=');

// Test intersection with other types
type UnknownRecordWithId = UnknownRecord & Readonly<{ id: string }>;
expectType<
  UnknownRecordWithId,
  ReadonlyRecord<string, unknown> & Readonly<{ id: string }>
>('=');

// Test union with other types
type MaybeUnknownRecord = UnknownRecord | null;
expectType<MaybeUnknownRecord, ReadonlyRecord<string, unknown> | null>('=');
