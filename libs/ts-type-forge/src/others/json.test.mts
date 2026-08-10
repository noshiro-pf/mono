import { expectType } from 'ts-data-forge';
import {
  type JsonObject,
  type JsonPrimitive,
  type JsonValue,
  type MutableJsonObject,
  type MutableJsonValue,
} from './json.mjs';

// JsonPrimitive
expectType<string, JsonPrimitive>('<=');

expectType<number, JsonPrimitive>('<=');

expectType<boolean, JsonPrimitive>('<=');

expectType<null, JsonPrimitive>('<=');

expectType<string | number, JsonPrimitive>('<=');

expectType<undefined, JsonPrimitive>('!<=');

expectType<symbol, JsonPrimitive>('!<=');

expectType<bigint, JsonPrimitive>('!<=');

expectType<{}, JsonPrimitive>('!<=');

expectType<readonly [], JsonPrimitive>('!<=');

// MutableJsonValue
expectType<string, MutableJsonValue>('<=');

expectType<number, MutableJsonValue>('<=');

expectType<boolean, MutableJsonValue>('<=');

expectType<null, MutableJsonValue>('<=');

expectType<JsonPrimitive, MutableJsonValue>('<=');

expectType<readonly string[], MutableJsonValue>('<=');

expectType<readonly number[], MutableJsonValue>('<=');

expectType<readonly boolean[], MutableJsonValue>('<=');

expectType<readonly null[], MutableJsonValue>('<=');

expectType<readonly JsonPrimitive[], MutableJsonValue>('<=');

expectType<Readonly<{ a: string }>, MutableJsonValue>('<=');

expectType<Readonly<{ a: number; b: readonly boolean[] }>, MutableJsonValue>(
  '<=',
);

expectType<Readonly<{ a: Readonly<{ b: null }> }>, MutableJsonValue>('<=');

expectType<readonly MutableJsonValue[], MutableJsonValue>('<=');

expectType<Readonly<{ [k: string]: MutableJsonValue }>, MutableJsonValue>('<=');

expectType<Record<string, MutableJsonValue>, MutableJsonValue>('<=');

expectType<undefined, MutableJsonValue>('!<=');

expectType<symbol, MutableJsonValue>('!<=');

expectType<bigint, MutableJsonValue>('!<=');

expectType<readonly string[], MutableJsonValue>('!<='); // Readonly array is not assignable

expectType<JsonValue, MutableJsonValue>('!<='); // JsonValue (potentially readonly) is not assignable

// JsonValue
expectType<string, JsonValue>('<=');

expectType<number, JsonValue>('<=');

expectType<boolean, JsonValue>('<=');

expectType<null, JsonValue>('<=');

expectType<JsonPrimitive, JsonValue>('<=');

expectType<readonly string[], JsonValue>('<=');

expectType<readonly number[], JsonValue>('<=');

expectType<readonly boolean[], JsonValue>('<=');

expectType<readonly null[], JsonValue>('<=');

expectType<readonly JsonPrimitive[], JsonValue>('<=');

expectType<Readonly<{ a: string }>, JsonValue>('<=');

expectType<Readonly<{ a: number; b: readonly boolean[] }>, JsonValue>('<=');

expectType<Readonly<{ a: Readonly<{ b: null }> }>, JsonValue>('<=');

expectType<readonly JsonValue[], JsonValue>('<=');

expectType<Readonly<{ [k: string]: JsonValue }>, JsonValue>('<=');

expectType<Readonly<Record<string, JsonValue>>, JsonValue>('<=');

expectType<undefined, JsonValue>('!<=');

expectType<symbol, JsonValue>('!<=');

expectType<bigint, JsonValue>('!<=');

expectType<readonly string[], JsonValue>('<='); // Mutable array IS assignable to readonly array

expectType<Readonly<{ a: string }>, JsonValue>('<='); // Mutable object IS assignable to readonly object

expectType<MutableJsonValue, JsonValue>('<='); // MutableJsonValue IS assignable to JsonValue

// JsonObject
expectType<Readonly<{ a: string }>, JsonObject>('<=');

expectType<Readonly<{ a: number; b: readonly boolean[] }>, JsonObject>('<=');

expectType<Readonly<{ a: Readonly<{ b: null }> }>, JsonObject>('<=');

expectType<Readonly<Record<string, JsonValue>>, JsonObject>('<=');

expectType<string, JsonObject>('!<=');

expectType<number, JsonObject>('!<=');

expectType<boolean, JsonObject>('!<=');

expectType<null, JsonObject>('!<=');

expectType<undefined, JsonObject>('!<=');

expectType<symbol, JsonObject>('!<=');

expectType<bigint, JsonObject>('!<=');

expectType<readonly string[], JsonObject>('!<='); // Array is not an object

expectType<Readonly<{ a: string }>, JsonObject>('<='); // Mutable object IS assignable

expectType<MutableJsonObject, JsonObject>('<='); // MutableJsonObject IS assignable

expectType<JsonValue, JsonObject>('!<='); // JsonValue includes primitives/arrays

// MutableJsonObject
expectType<Readonly<{ a: string }>, MutableJsonObject>('<=');

expectType<Readonly<{ a: number; b: readonly boolean[] }>, MutableJsonObject>(
  '<=',
);

expectType<Readonly<{ a: Readonly<{ b: null }> }>, MutableJsonObject>('<=');

expectType<Record<string, MutableJsonValue>, MutableJsonObject>('<=');

expectType<string, MutableJsonObject>('!<=');

expectType<number, MutableJsonObject>('!<=');

expectType<boolean, MutableJsonObject>('!<=');

expectType<null, MutableJsonObject>('!<=');

expectType<undefined, MutableJsonObject>('!<=');

expectType<symbol, MutableJsonObject>('!<=');

expectType<bigint, MutableJsonObject>('!<=');

expectType<readonly string[], MutableJsonObject>('!<='); // Array is not an object

expectType<readonly string[], MutableJsonObject>('!<=');

expectType<JsonObject, MutableJsonObject>('!<='); // Readonly JsonObject is not assignable

expectType<MutableJsonValue, MutableJsonObject>('!<='); // MutableJsonValue includes primitives/arrays
