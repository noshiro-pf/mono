import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { record } from '../record/index.mjs';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { SetType } from './set.mjs';

test('SetType with string elements', () => {
  const StringSet = SetType(string());

  type StringSet = TypeOf<typeof StringSet>;

  // Type test

  expectType<StringSet, ReadonlySet<string>>('=');

  // Valid set
  const validSet = new Set(['a', 'b', 'c']);

  // is() test

  assert.isTrue(StringSet.is(validSet));

  assert.isTrue(StringSet.is(new Set()));

  assert.isFalse(StringSet.is({}));

  assert.isFalse(StringSet.is([]));

  assert.isFalse(StringSet.is(null));

  assert.isFalse(StringSet.is(undefined));

  // validate() test
  const result = StringSet.validate(validSet);

  assert.isTrue(Result.isOk(result));

  const resultValue = Result.unwrapThrow(result);

  expect(resultValue).toBe(validSet); // Same reference
});

test('SetType with number elements', () => {
  const NumberSet = SetType(number());

  type NumberSet = TypeOf<typeof NumberSet>;

  // Type test

  expectType<NumberSet, ReadonlySet<number>>('=');

  const validSet = new Set([1, 2, 3, 4, 5]);

  // is() test

  assert.isTrue(NumberSet.is(validSet));

  // validate() test
  const result = NumberSet.validate(validSet);

  assert.isTrue(Result.isOk(result));

  const resultValue1 = Result.unwrapThrow(result);

  expect(resultValue1).toBe(validSet);
});

test('SetType with invalid element types', () => {
  const StringSet = SetType(string());

  const invalidSet = new Set<unknown>(['valid', 123, 'another', true]);

  // is() test

  assert.isFalse(StringSet.is(invalidSet));

  // validate() test
  const result = StringSet.validate(invalidSet);

  assert.isTrue(Result.isErr(result));

  const resultError = Result.unwrapErrThrow(result);

  expect(resultError.length).toBeGreaterThan(0);

  assert.deepStrictEqual(validationErrorsToMessages(resultError), [
    'Error: expected Set element type to be <string> but <number> type value `123` was passed.',
    'Error: expected <string> type but <number> type value `123` was passed.',
    'Error: expected Set element type to be <string> but <boolean> type value `true` was passed.',
    'Error: expected <string> type but <boolean> type value `true` was passed.',
  ]);
});

test('SetType fill() method', () => {
  const NumberSet = SetType(number());

  // Valid set - should preserve all elements
  const validSet = new Set([1, 2, 3]);

  const filled1 = NumberSet.fill(validSet);

  expect(filled1.size).toBe(3);

  assert.isTrue(filled1.has(1));

  assert.isTrue(filled1.has(2));

  assert.isTrue(filled1.has(3));

  // Mixed valid/invalid elements - should filter out invalid ones
  const mixedSet = new Set<unknown>([1, 'not a number', 2, true, 3]);

  const filled2 = NumberSet.fill(mixedSet);

  expect(filled2.size).toBe(3);

  assert.isTrue(filled2.has(1));

  assert.isTrue(filled2.has(2));

  assert.isTrue(filled2.has(3));

  // Non-set input - should return default (empty set)
  const filled3 = NumberSet.fill({});

  expect(filled3.size).toBe(0);

  assert.deepStrictEqual(filled3, new Set());
});

test('SetType cast() method', () => {
  const StringSet = SetType(string());

  // Valid set
  const validSet = new Set(['hello', 'world']);

  const casted = StringSet.cast(validSet);

  expect(casted).toBe(validSet);

  // Invalid input - should throw

  expect(() => StringSet.cast('not a set')).toThrow(
    'Error: expected <Set> type but <string> type value',
  );

  expect(() => StringSet.cast([])).toThrow(
    'Error: expected <Set> type but <object> type value',
  );
});

test('SetType assertIs() method', () => {
  const NumberSet = SetType(number());

  const assertIsNumberSet: (a: unknown) => asserts a is ReadonlySet<number> =
    NumberSet.assertIs;

  // Valid set - should not throw
  const validSet = new Set([1, 2, 3]);

  expect(() => {
    assertIsNumberSet(validSet);
  }).not.toThrow();

  // Invalid input - should throw

  expect(() => {
    assertIsNumberSet('not a set');
  }).toThrow('Error: expected <Set> type but <string> type value');

  expect(() => {
    assertIsNumberSet([1, 2, 3]);
  }).toThrow('Error: expected <Set> type but <object> type value');
});

test('SetType with custom typeName', () => {
  const CustomSet = SetType(string(), {
    typeName: 'CustomStringSet',
  });

  expect(CustomSet.typeName).toBe('CustomStringSet');

  // Error message should include custom type name
  const result = CustomSet.validate('not a set');

  assert.isTrue(Result.isErr(result));

  const resultError1 = Result.unwrapErrThrow(result);

  expect(resultError1[0]?.typeName).toBe('CustomStringSet');
});

test('SetType with complex element types', () => {
  const UserType = record({
    id: number(),
    name: string(),
  });

  const UserSet = SetType(UserType);

  type UserSet = TypeOf<typeof UserSet>;

  // Type test

  expectType<UserSet, ReadonlySet<Readonly<{ id: number; name: string }>>>('=');

  const user1 = { id: 1, name: 'Alice' } as const;

  const user2 = { id: 2, name: 'Bob' } as const;

  const validSet = new Set([user1, user2]);

  // is() test

  assert.isTrue(UserSet.is(validSet));

  // validate() test
  const result = UserSet.validate(validSet);

  assert.isTrue(Result.isOk(result));

  // Invalid element
  const invalidSet = new Set([
    user1,
    { id: 'invalid', name: 'Charlie' }, // Invalid id type
  ]);

  assert.isFalse(UserSet.is(invalidSet));
});

test('SetType defaultValue', () => {
  const StringSet = SetType(string());

  assert.deepStrictEqual(StringSet.defaultValue, new Set());

  expect(StringSet.defaultValue.size).toBe(0);
});

test('SetType ensures uniqueness', () => {
  const NumberSet = SetType(number());

  // Set with duplicate values (Set automatically handles uniqueness)
  const setWithDuplicates = new Set([1, 2, 2, 3, 3, 3]);

  expect(setWithDuplicates.size).toBe(3); // Only unique values

  assert.isTrue(NumberSet.is(setWithDuplicates));

  const result = NumberSet.validate(setWithDuplicates);

  assert.isTrue(Result.isOk(result));
});
