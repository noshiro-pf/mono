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

  assert.isTrue(StringNumberMap.is(validMap));

  assert.isTrue(StringNumberMap.is(new Map()));

  assert.isFalse(StringNumberMap.is({}));

  assert.isFalse(StringNumberMap.is([]));

  assert.isFalse(StringNumberMap.is(null));

  assert.isFalse(StringNumberMap.is(undefined));

  // validate() test
  const result = StringNumberMap.validate(validMap);

  assert.isTrue(Result.isOk(result));

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

  assert.isFalse(StringNumberMap.is(invalidMap));

  // validate() test
  const result = StringNumberMap.validate(invalidMap);

  assert.isTrue(Result.isErr(result));

  const resultError = Result.unwrapErrThrow(result);

  expect(resultError.length).toBeGreaterThan(0);

  assert.deepStrictEqual(validationErrorsToMessages(resultError), [
    'Error: expected Map key type to be <string> but <number> type value `123` was passed.',
    'Error: expected <string> type but <number> type value `123` was passed.',
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

  assert.isFalse(StringNumberMap.is(invalidMap));

  // validate() test
  const result = StringNumberMap.validate(invalidMap);

  assert.isTrue(Result.isErr(result));

  const resultError1 = Result.unwrapErrThrow(result);

  expect(resultError1.length).toBeGreaterThan(0);

  assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
    'Error: expected Map value type to be <number> but <string> type value "not a number" was passed.',
    'Error at b: expected <number> type but <string> type value "not a number" was passed.',
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

  expect(() => StringNumberMap.cast('not a map')).toThrowError(
    'Error: expected <Map> type but <string> type value',
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
  }).not.toThrowError();

  // Invalid input - should throw

  expect(() => {
    assertIsStringNumberMap('not a map');
  }).toThrowError('Error: expected <Map> type but <string> type value');
});

test('MapType with custom typeName', () => {
  const CustomMap = MapType(string(), number(), {
    typeName: 'CustomStringNumberMap',
  });

  expect(CustomMap.typeName).toBe('CustomStringNumberMap');

  // Error message should include custom type name
  const result = CustomMap.validate('not a map');

  assert.isTrue(Result.isErr(result));

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

  assert.isTrue(NumberStringMap.is(validMap));

  const result = NumberStringMap.validate(validMap);

  assert.isTrue(Result.isOk(result));
});

test('MapType defaultValue', () => {
  const StringNumberMap = MapType(string(), number());

  assert.deepStrictEqual(StringNumberMap.defaultValue, new Map());

  expect(StringNumberMap.defaultValue.size).toBe(0);
});
