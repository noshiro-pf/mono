import { expectType } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { boolean, nullType, number, string } from '../primitives/index.mjs';
import { keyValueRecord, record } from '../record/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { recursion } from './recursion.mjs';
import { union } from './union.mjs';

describe('recursive', () => {
  // Define JsonPrimitive type
  const JsonPrimitive = union([nullType, number(), string(), boolean()]);

  type JsonPrimitive = TypeOf<typeof JsonPrimitive>;

  test('JsonPrimitive.defaultValue', () => {
    expectType<JsonPrimitive, null | boolean | number | string>('=');

    expect(JsonPrimitive.defaultValue).toBeNull();
  });

  // Define recursive JsonValue type
  type JsonValue =
    | JsonPrimitive
    | Readonly<{
        [k: string]: JsonValue;
      }>
    | readonly JsonValue[];

  const JsonValue: Type<JsonValue> = recursion('JsonValue', () =>
    union([
      JsonPrimitive,
      keyValueRecord(string(), JsonValue),
      array(JsonValue),
    ]),
  );

  test('JsonValue.defaultValue', () => {
    expectType<TypeOf<typeof JsonValue>, JsonValue>('=');

    expect(JsonValue.defaultValue).toBeNull();
  });

  test('JsonValue - primitive values', () => {
    expect(JsonValue.is(true)).toBe(true);
    expect(JsonValue.is(false)).toBe(true);
    expect(JsonValue.is(42)).toBe(true);
    expect(JsonValue.is(3.14)).toBe(true);
    expect(JsonValue.is('hello')).toBe(true);
    expect(JsonValue.is(null)).toBe(true);
    expect(JsonValue.is(undefined)).toBe(false);
  });

  test('JsonValue - arrays', () => {
    expect(JsonValue.is([])).toBe(true);
    expect(JsonValue.is([1, 2, 3])).toBe(true);
    expect(JsonValue.is(['a', 'b', 'c'])).toBe(true);
    expect(JsonValue.is([true, false, null])).toBe(true);
    expect(JsonValue.is([1, 'a', true, null])).toBe(true);
  });

  test('JsonValue - objects', () => {
    expect(JsonValue.is({})).toBe(true);
    expect(JsonValue.is({ a: 1 })).toBe(true);
    expect(JsonValue.is({ a: 1, b: 'hello' })).toBe(true);
    expect(JsonValue.is({ a: 1, b: [1, 2, 3] })).toBe(true);
  });

  test('JsonValue - nested structures', () => {
    const nestedData = {
      name: 'John',
      age: 30,
      active: true,
      address: {
        street: '123 Main St',
        city: 'New York',
        coordinates: {
          lat: 40.7128,
          lon: -74.006,
        },
      },
      hobbies: ['reading', 'coding', 'gaming'],
      scores: [95, 87, 92],
      metadata: null,
      tags: [],
      settings: {
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
        },
      },
    };

    expect(JsonValue.is(nestedData)).toBe(true);
  });

  test('JsonValue - deeply nested arrays', () => {
    const deepArray = [
      [
        [1, 2, 3],
        [4, 5, 6],
      ],
      [
        [7, 8, 9],
        [10, 11, 12],
      ],
    ];

    expect(JsonValue.is(deepArray)).toBe(true);
  });

  test('JsonValue - mixed nested structure', () => {
    const mixedData = {
      users: [
        {
          id: 1,
          name: 'Alice',
          tasks: [
            { id: 'task1', completed: true },
            { id: 'task2', completed: false },
          ],
        },
        {
          id: 2,
          name: 'Bob',
          tasks: [],
        },
      ],
      config: {
        version: '1.0.0',
        features: ['feature1', 'feature2'],
        settings: {
          debug: false,
          timeout: 5000,
        },
      },
    };

    expect(JsonValue.is(mixedData)).toBe(true);
  });

  test('JsonValue - invalid values', () => {
    expect(JsonValue.is(undefined)).toBe(false);
    expect(JsonValue.is(Symbol('test'))).toBe(false);
    expect(JsonValue.is(() => 'function')).toBe(false);

    // Note: keyValueRecord accepts any object with string keys, including Date/Set/Map
    // This is expected behavior for keyValueRecord, which doesn't distinguish
    // between plain objects and other object instances
  });

  test('JsonValue - cast function', () => {
    const result = JsonValue.cast({ a: 1, b: [2, 3], c: { d: 'hello' } });
    expect(result).toStrictEqual({ a: 1, b: [2, 3], c: { d: 'hello' } });
  });

  test('JsonValue - fill function', () => {
    const result = JsonValue.fill({ a: 1, b: [2, 3] });
    expect(result).toStrictEqual({ a: 1, b: [2, 3] });

    // Fill with default value for invalid input
    const defaultResult = JsonValue.fill(undefined);
    expect(JsonValue.is(defaultResult)).toBe(true);
  });

  // Test other recursive structures
  test('Linked list structure', () => {
    type LinkedList<T> = { value: T; next: LinkedList<T> | null };

    const LinkedListNumber: Type<LinkedList<number>> = recursion(
      'LinkedList<number>',
      () =>
        record({
          value: number(0),
          next: union([nullType, LinkedListNumber]),
        }),
      { defaultValue: { value: 0, next: null } },
    );

    const list: LinkedList<number> = {
      value: 1,
      next: {
        value: 2,
        next: {
          value: 3,
          next: null,
        },
      },
    };

    expect(LinkedListNumber.is(list)).toBe(true);
    expect(LinkedListNumber.is({ value: 1, next: null })).toBe(true);
    expect(LinkedListNumber.is({ value: 'not a number', next: null })).toBe(
      false,
    );
  });

  test('Tree structure', () => {
    type TreeNode<T> = Readonly<{
      value: T;
      children: readonly TreeNode<T>[];
    }>;

    const TreeNodeString: Type<TreeNode<string>> = recursion(
      'TreeNode<string>',
      () =>
        record({
          value: string(),
          children: array(TreeNodeString),
        }),
    );

    const tree: TreeNode<string> = {
      value: 'root',
      children: [
        {
          value: 'branch1',
          children: [
            { value: 'leaf1', children: [] },
            { value: 'leaf2', children: [] },
          ],
        },
        {
          value: 'branch2',
          children: [{ value: 'leaf3', children: [] }],
        },
      ],
    };

    expect(TreeNodeString.is(tree)).toBe(true);
    expect(TreeNodeString.is({ value: 'node', children: [] })).toBe(true);
    expect(TreeNodeString.is({ value: 123, children: [] })).toBe(false);
  });
});
