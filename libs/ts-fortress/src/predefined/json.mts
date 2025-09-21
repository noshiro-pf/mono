import { expectType } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { union } from '../compose/index.mjs';
import { recursion } from '../other-types/index.mjs';
import { boolean, nullType, number, string } from '../primitives/index.mjs';
import { keyValueRecord } from '../record/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';

export const JsonPrimitive = union([nullType, number(), string(), boolean()]);

if (import.meta.vitest !== undefined) {
  test('JsonPrimitive', () => {
    expectType<TypeOf<typeof JsonPrimitive>, JsonPrimitive>('=');
    expectType<JsonPrimitive, null | boolean | number | string>('=');

    expect(JsonPrimitive.defaultValue).toBeNull();
  });
}

export const JsonValue: Type<JsonValue> = recursion('JsonValue', () =>
  union([JsonPrimitive, keyValueRecord(string(), JsonValue), array(JsonValue)]),
);

if (import.meta.vitest !== undefined) {
  test('JsonValue', () => {
    expectType<TypeOf<typeof JsonValue>, JsonValue>('=');

    expect(JsonValue.defaultValue).toBeNull();
  });
}

type JsonObject = ReadonlyRecord<string, JsonValue>;

export const JsonObject = keyValueRecord(string(), JsonValue);
