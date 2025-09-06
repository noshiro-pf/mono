import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { MapType } from './map.mjs';

test('MapType with string keys and number values', () => {
  const StringNumberMap = MapType(string(''), number(0));
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
  if (Result.isOk(result)) {
    expect(result.value).toBe(validMap); // Same reference
  }
});

test('MapType with invalid key types', () => {
  const StringNumberMap = MapType(string(''), number(0));

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
  if (Result.isErr(result)) {
    expect(result.value.length).toBeGreaterThan(0);
    expect(result.value[0]?.message).toContain('key of the Map');
  }
});

test('MapType with invalid value types', () => {
  const StringNumberMap = MapType(string(''), number(0));

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
  if (Result.isErr(result)) {
    expect(result.value.length).toBeGreaterThan(0);
    expect(result.value[0]?.message).toContain('value of the Map');
  }
});

test('MapType fill() method', () => {
  const StringNumberMap = MapType(string(''), number(0));

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
  expect(filled3).toStrictEqual(new Map());
});

test('MapType cast() method', () => {
  const StringNumberMap = MapType(string(''), number(0));

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
  const StringNumberMap = MapType(string(''), number(0));

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
  const CustomMap = MapType(string(''), number(0), {
    typeName: 'CustomStringNumberMap',
  });

  expect(CustomMap.typeName).toBe('CustomStringNumberMap');

  // Error message should include custom type name
  const result = CustomMap.validate('not a map');
  expect(Result.isErr(result)).toBe(true);
  if (Result.isErr(result)) {
    expect(result.value[0]?.typeName).toBe('CustomStringNumberMap');
  }
});

test('MapType with number keys and string values', () => {
  const NumberStringMap = MapType(number(0), string(''));
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
  const StringNumberMap = MapType(string(''), number(0));

  expect(StringNumberMap.defaultValue).toStrictEqual(new Map());
  expect(StringNumberMap.defaultValue.size).toBe(0);
});
