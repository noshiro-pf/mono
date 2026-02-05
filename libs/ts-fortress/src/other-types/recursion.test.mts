import { expectType } from 'ts-data-forge';
import { array } from '../array/index.mjs';
import { union } from '../compose/index.mjs';
import { boolean, nullType, number, string } from '../primitives/index.mjs';
import { keyValueRecord, record } from '../record/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { literal } from './literal.mjs';
import { recursion } from './recursion.mjs';

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
    assert.isTrue(JsonValue.is(true));

    assert.isTrue(JsonValue.is(false));

    assert.isTrue(JsonValue.is(42));

    assert.isTrue(JsonValue.is(3.14));

    assert.isTrue(JsonValue.is('hello'));

    assert.isTrue(JsonValue.is(null));

    assert.isFalse(JsonValue.is(undefined));
  });

  test('JsonValue - arrays', () => {
    assert.isTrue(JsonValue.is([]));

    assert.isTrue(JsonValue.is([1, 2, 3]));

    assert.isTrue(JsonValue.is(['a', 'b', 'c']));

    assert.isTrue(JsonValue.is([true, false, null]));

    assert.isTrue(JsonValue.is([1, 'a', true, null]));
  });

  test('JsonValue - objects', () => {
    assert.isTrue(JsonValue.is({}));

    assert.isTrue(JsonValue.is({ a: 1 }));

    assert.isTrue(JsonValue.is({ a: 1, b: 'hello' }));

    assert.isTrue(JsonValue.is({ a: 1, b: [1, 2, 3] }));
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

    assert.isTrue(JsonValue.is(nestedData));
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

    assert.isTrue(JsonValue.is(deepArray));
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

    assert.isTrue(JsonValue.is(mixedData));
  });

  test('JsonValue - invalid values', () => {
    assert.isFalse(JsonValue.is(undefined));

    assert.isFalse(JsonValue.is(Symbol('test')));

    assert.isFalse(JsonValue.is(() => 'function'));

    // Note: keyValueRecord accepts any object with string keys, including Date/Set/Map
    // This is expected behavior for keyValueRecord, which doesn't distinguish
    // between plain objects and other object instances
  });

  test('JsonValue - cast function', () => {
    const result = JsonValue.cast({ a: 1, b: [2, 3], c: { d: 'hello' } });

    assert.deepStrictEqual(result, { a: 1, b: [2, 3], c: { d: 'hello' } });
  });

  test('JsonValue - fill function', () => {
    const result = JsonValue.fill({ a: 1, b: [2, 3] });

    assert.deepStrictEqual(result, { a: 1, b: [2, 3] });

    // Fill with default value for invalid input
    const defaultResult = JsonValue.fill(undefined);

    assert.isTrue(JsonValue.is(defaultResult));
  });

  // Test other recursive structures
  test('Linked list structure', () => {
    type LinkedList<T> = Readonly<{ value: T; next: LinkedList<T> | null }>;

    const LinkedListNumber: Type<LinkedList<number>> = recursion(
      'LinkedList<number>',
      () =>
        record({
          value: number(),
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

    assert.isTrue(LinkedListNumber.is(list));

    assert.isTrue(LinkedListNumber.is({ value: 1, next: null }));

    assert.isFalse(LinkedListNumber.is({ value: 'not a number', next: null }));
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

    assert.isTrue(TreeNodeString.is(tree));

    assert.isTrue(TreeNodeString.is({ value: 'node', children: [] }));

    assert.isFalse(TreeNodeString.is({ value: 123, children: [] }));
  });

  test('Mutual recursion - demonstrates lazy evaluation', () => {
    type EvenNumber = Readonly<{ type: 'even'; next: OddNumber | null }>;

    type OddNumber = Readonly<{ type: 'odd'; next: EvenNumber | null }>;

    // With _getDefaultValue, type definitions are created without immediate evaluation
    const EvenNumber: Type<EvenNumber> = recursion('EvenNumber', () =>
      record({
        type: literal('even'),
        next: union([nullType, OddNumber]), // nullType first to compute defaultValue
      }),
    );

    const OddNumber: Type<OddNumber> = recursion('OddNumber', () =>
      record({
        type: literal('odd'),
        next: union([nullType, EvenNumber]), // nullType first to compute defaultValue
      }),
    );

    // Type checking works fine
    assert.isTrue(OddNumber.is({ type: 'odd', next: null }));

    assert.isTrue(EvenNumber.is({ type: 'even', next: null }));

    // defaultValue is accessible when terminal types are first
    const evenDefault = EvenNumber.defaultValue;

    assert.isTrue(EvenNumber.is(evenDefault));
  });
});
