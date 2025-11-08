import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { MapType } from './map.mjs';

test('MapType with string keys and number values', () => {
  const StringNumberMap = MapType(string(), number());
  type StringNumberMap = TypeOf<typeof StringNumberMap>;

  // Type test

  expectType<StringNumberMap, ReadonlyMap<string, number>>('=');

  // Valid map
  const validMap = new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3],
  ]);

  // is() test

  expect(StringNumberMap.is(validMap)).toBe(true);

  expect(StringNumberMap.is(new Map())).toBe(true);

  expect(StringNumberMap.is({})).toBe(false);

  expect(StringNumberMap.is([])).toBe(false);

  expect(StringNumberMap.is(null)).toBe(false);

  expect(StringNumberMap.is(undefined)).toBe(false);

  // validate() test
  const result = StringNumberMap.validate(validMap);

  expect(Result.isOk(result)).toBe(true);

  const resultValue = Result.unwrapThrow(result);

  expect(resultValue).toBe(validMap); // Same reference
});

test('MapType with invalid key types', () => {
  const StringNumberMap = MapType(string(), number());

  const invalidMap = new Map<unknown, unknown>([
    ['valid', 1],
    [123, 2], // Invalid key type
    ['another', 3],
  ]);

  // is() test

  expect(StringNumberMap.is(invalidMap)).toBe(false);

  // validate() test
  const result = StringNumberMap.validate(invalidMap);

  expect(Result.isErr(result)).toBe(true);

  const resultError = Result.unwrapErrThrow(result);

  expect(resultError.length).toBeGreaterThan(0);

  assert.deepStrictEqual(validationErrorsToMessages(resultError), [
    'The key of the Map is expected to be <string>, but got <number> type value `123`',
    'Expected <string>, got <number> type value `123`.',
  ]);
});

test('MapType with invalid value types', () => {
  const StringNumberMap = MapType(string(), number());

  const invalidMap = new Map<unknown, unknown>([
    ['a', 1],
    ['b', 'not a number'], // Invalid value type
    ['c', 3],
  ]);

  // is() test

  expect(StringNumberMap.is(invalidMap)).toBe(false);

  // validate() test
  const result = StringNumberMap.validate(invalidMap);

  expect(Result.isErr(result)).toBe(true);

  const resultError1 = Result.unwrapErrThrow(result);

  expect(resultError1.length).toBeGreaterThan(0);

  assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
    'The value of the Map is expected to be <number>, but got <string> type value `not a number`',
    'Expected <number> at b, got <string> type value "not a number".',
  ]);
});

test('MapType fill() method', () => {
  const StringNumberMap = MapType(string(), number());

  // Valid map - should preserve valid entries
  const validMap = new Map([
    ['a', 1],
    ['b', 2],
  ]);
  const filled1 = StringNumberMap.fill(validMap);

  expect(filled1.size).toBe(2);

  expect(filled1.get('a')).toBe(1);

  expect(filled1.get('b')).toBe(2);

  // Mixed valid/invalid entries - should filter out invalid ones
  const mixedMap = new Map<unknown, unknown>([
    ['valid', 1],
    [123, 2], // Invalid key
    ['another', 'not a number'], // Invalid value
    ['good', 3],
  ]);
  const filled2 = StringNumberMap.fill(mixedMap);

  expect(filled2.size).toBe(2);

  expect(filled2.get('valid')).toBe(1);

  expect(filled2.get('good')).toBe(3);

  // Non-map input - should return default (empty map)
  const filled3 = StringNumberMap.fill({});

  expect(filled3.size).toBe(0);

  assert.deepStrictEqual(filled3, new Map());
});

test('MapType cast() method', () => {
  const StringNumberMap = MapType(string(), number());

  // Valid map
  const validMap = new Map([['key', 42]]);
  const casted = StringNumberMap.cast(validMap);

  expect(casted).toBe(validMap);

  // Invalid input - should throw

  expect(() => StringNumberMap.cast('not a map')).toThrow(
    'Expected <Map>, got <string> type value',
  );
});

test('MapType assertIs() method', () => {
  const StringNumberMap = MapType(string(), number());

  const assertIsStringNumberMap: (
    a: unknown,
  ) => asserts a is ReadonlyMap<string, number> = StringNumberMap.assertIs;

  // Valid map - should not throw
  const validMap = new Map([['key', 42]]);

  expect(() => {
    assertIsStringNumberMap(validMap);
  }).not.toThrow();

  // Invalid input - should throw

  expect(() => {
    assertIsStringNumberMap('not a map');
  }).toThrow('Expected <Map>, got <string> type value');
});

test('MapType with custom typeName', () => {
  const CustomMap = MapType(string(), number(), {
    typeName: 'CustomStringNumberMap',
  });

  expect(CustomMap.typeName).toBe('CustomStringNumberMap');

  // Error message should include custom type name
  const result = CustomMap.validate('not a map');

  expect(Result.isErr(result)).toBe(true);

  const resultError2 = Result.unwrapErrThrow(result);

  expect(resultError2[0]?.typeName).toBe('CustomStringNumberMap');
});

test('MapType with number keys and string values', () => {
  const NumberStringMap = MapType(number(), string());
  type NumberStringMap = TypeOf<typeof NumberStringMap>;

  // Type test

  expectType<NumberStringMap, ReadonlyMap<number, string>>('=');

  const validMap = new Map([
    [1, 'one'],
    [2, 'two'],
    [3, 'three'],
  ]);

  expect(NumberStringMap.is(validMap)).toBe(true);

  const result = NumberStringMap.validate(validMap);

  expect(Result.isOk(result)).toBe(true);
});

test('MapType defaultValue', () => {
  const StringNumberMap = MapType(string(), number());

  assert.deepStrictEqual(StringNumberMap.defaultValue, new Map());

  expect(StringNumberMap.defaultValue.size).toBe(0);
});
