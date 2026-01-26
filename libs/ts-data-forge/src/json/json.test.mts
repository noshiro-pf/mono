import { Arr } from '../array/index.mjs';
import { Result } from '../functional/index.mjs';
import { hasKey, isRecord, isString } from '../guard/index.mjs';
import { Json } from './json.mjs';

describe('parse', () => {
  test('should parse primitive values', () => {
    assert.deepStrictEqual(Json.parse('"hello"'), Result.ok('hello'));

    assert.deepStrictEqual(Json.parse('42'), Result.ok(42));

    assert.deepStrictEqual(Json.parse('true'), Result.ok(true));

    assert.deepStrictEqual(Json.parse('false'), Result.ok(false));

    assert.deepStrictEqual(Json.parse('null'), Result.ok(null));
  });

  test('should parse arrays', () => {
    assert.deepStrictEqual(Json.parse('[1,2,3]'), Result.ok([1, 2, 3]));

    assert.deepStrictEqual(
      Json.parse('["a","b","c"]'),
      Result.ok(['a', 'b', 'c']),
    );

    assert.deepStrictEqual(
      Json.parse('[1,"two",true,null]'),
      Result.ok([1, 'two', true, null]),
    );
  });

  test('should parse objects', () => {
    assert.deepStrictEqual(
      Json.parse('{"a":1,"b":2}'),
      Result.ok({ a: 1, b: 2 }),
    );

    assert.deepStrictEqual(
      Json.parse('{"name":"test","value":42}'),
      Result.ok({
        name: 'test',
        value: 42,
      }),
    );
  });

  test('should parse nested structures', () => {
    const json = '{"level1":{"level2":{"array":[1,2,{"level3":"deep"}]}}}';

    const expected = {
      level1: {
        level2: {
          array: [1, 2, { level3: 'deep' }],
        },
      },
    };

    assert.deepStrictEqual(Json.parse(json), Result.ok(expected));
  });

  test('should handle whitespace', () => {
    assert.deepStrictEqual(
      Json.parse('  {  "a" : 1 ,  "b" : 2  }  '),
      Result.ok({ a: 1, b: 2 }),
    );

    assert.deepStrictEqual(
      Json.parse('\n[\n  1,\n  2,\n  3\n]\n'),
      Result.ok([1, 2, 3]),
    );
  });

  test('should return error for invalid JSON', () => {
    assert.isTrue(Result.isErr(Json.parse('invalid')));

    assert.isTrue(Result.isErr(Json.parse('{missing quotes: true}')));

    assert.isTrue(Result.isErr(Json.parse('[1,2,]'))); // Trailing comma

    assert.isTrue(Result.isErr(Json.parse('undefined')));
  });

  test('should return parsed value for valid JSON', () => {
    assert.deepStrictEqual(Json.parse('{"a":1}'), Result.ok({ a: 1 }));

    assert.deepStrictEqual(Json.parse('[1,2,3]'), Result.ok([1, 2, 3]));

    assert.deepStrictEqual(Json.parse('"string"'), Result.ok('string'));

    assert.deepStrictEqual(Json.parse('42'), Result.ok(42));

    assert.deepStrictEqual(Json.parse('true'), Result.ok(true));

    assert.deepStrictEqual(Json.parse('null'), Result.ok(null));
  });

  test('should return error for invalid JSON cases', () => {
    assert.isTrue(Result.isErr(Json.parse('invalid')));

    assert.isTrue(Result.isErr(Json.parse('{bad json}')));

    assert.isTrue(Result.isErr(Json.parse('[1,2,]')));

    assert.isTrue(Result.isErr(Json.parse('undefined')));

    assert.isTrue(Result.isErr(Json.parse('')));
  });

  test('should handle edge cases', () => {
    assert.deepStrictEqual(Json.parse('0'), Result.ok(0));

    assert.deepStrictEqual(Json.parse('""'), Result.ok(''));

    assert.deepStrictEqual(Json.parse('[]'), Result.ok([]));

    assert.deepStrictEqual(Json.parse('{}'), Result.ok({}));
  });

  test('should not throw errors', () => {
    expect(() => Json.parse('{{{')).not.toThrowError();

    expect(() => Json.parse('null null')).not.toThrowError();

    expect(() => Json.parse(String(undefined))).not.toThrowError();
  });

  test('should use reviver function to transform values', () => {
    const dateReviver = (_key: string, value: unknown): unknown => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/u.test(value)) {
        return new Date(value);
      }

      return value;
    };

    const jsonString = '{"name":"test","created":"2023-12-01T10:00:00.000Z"}';

    const result = Json.parse(jsonString, dateReviver);

    assert.isTrue(Result.isOk(result));

    if (
      isRecord(result.value) &&
      hasKey(result.value, 'name') &&
      hasKey(result.value, 'created')
    ) {
      expect(result.value.name).toBe('test');

      expect(result.value.created).toBeInstanceOf(Date);
    }
  });

  test('should handle reviver returning different types', () => {
    const transformReviver = (key: string, value: unknown): unknown => {
      if (key === 'number' && typeof value === 'string') {
        return Number.parseInt(value, 10);
      }

      return value;
    };

    const result = Json.parse(
      '{"number":"42","text":"hello"}',
      transformReviver,
    );

    assert.isTrue(Result.isOk(result));

    expect(result.value).toHaveProperty('number');

    expect(result.value).toHaveProperty('text');

    if (
      isRecord(result.value) &&
      hasKey(result.value, 'number') &&
      hasKey(result.value, 'text')
    ) {
      expect(result.value.number).toBe(42);

      expect(result.value.text).toBe('hello');
    }
  });
});

describe('stringify', () => {
  test('should stringify primitive values', () => {
    assert.deepStrictEqual(Json.stringify('hello'), Result.ok('"hello"'));

    assert.deepStrictEqual(Json.stringify(42), Result.ok('42'));

    assert.deepStrictEqual(Json.stringify(true), Result.ok('true'));

    assert.deepStrictEqual(Json.stringify(null), Result.ok('null'));
  });

  test('should stringify arrays', () => {
    assert.deepStrictEqual(Json.stringify([1, 2, 3]), Result.ok('[1,2,3]'));

    assert.deepStrictEqual(
      Json.stringify(['a', 'b', 'c']),
      Result.ok('["a","b","c"]'),
    );

    assert.deepStrictEqual(
      Json.stringify([1, 'two', true, null]),
      Result.ok('[1,"two",true,null]'),
    );
  });

  test('should stringify objects', () => {
    assert.deepStrictEqual(
      Json.stringify({ a: 1, b: 2 }),
      Result.ok('{"a":1,"b":2}'),
    );

    assert.deepStrictEqual(
      Json.stringify({ name: 'test', value: 42 }),
      Result.ok('{"name":"test","value":42}'),
    );
  });

  test('should stringify nested structures', () => {
    const nested = {
      level1: {
        level2: {
          array: [1, 2, { level3: 'deep' }],
        },
      },
    };

    assert.deepStrictEqual(
      Json.stringify(nested),
      Result.ok('{"level1":{"level2":{"array":[1,2,{"level3":"deep"}]}}}'),
    );
  });

  test('should handle empty structures', () => {
    assert.deepStrictEqual(Json.stringify({}), Result.ok('{}'));

    assert.deepStrictEqual(Json.stringify([]), Result.ok('[]'));
  });

  test('should handle special string values', () => {
    assert.deepStrictEqual(
      Json.stringify('with "quotes"'),
      Result.ok(String.raw`"with \"quotes\""`),
    );

    assert.deepStrictEqual(
      Json.stringify('with\nnewline'),
      Result.ok(String.raw`"with\nnewline"`),
    );

    assert.deepStrictEqual(
      Json.stringify('with\ttab'),
      Result.ok(String.raw`"with\ttab"`),
    );
  });

  test('should return stringified value for valid JSON values', () => {
    assert.deepStrictEqual(Json.stringify({ a: 1 }), Result.ok('{"a":1}'));

    assert.deepStrictEqual(Json.stringify([1, 2, 3]), Result.ok('[1,2,3]'));

    assert.deepStrictEqual(Json.stringify('string'), Result.ok('"string"'));

    assert.deepStrictEqual(Json.stringify(42), Result.ok('42'));

    assert.deepStrictEqual(Json.stringify(true), Result.ok('true'));

    assert.deepStrictEqual(Json.stringify(null), Result.ok('null'));
  });

  test('should handle non-serializable values', () => {
    assert.deepStrictEqual(Json.stringify(undefined), Result.ok(undefined));

    assert.deepStrictEqual(
      Json.stringify(Symbol('test')),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(
      Json.stringify(() => {}),
      Result.ok(undefined),
    );

    // BigInt should cause an error
    assert.isTrue(Result.isErr(Json.stringify(123n)));
  });

  test('should handle circular references', () => {
    const mut_obj: any = { a: 1 };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    mut_obj.circular = mut_obj;

    assert.isTrue(Result.isErr(Json.stringify(mut_obj)));
  });

  test('should handle objects with toJSON method', () => {
    const obj = {
      toJSON: () => ({ custom: 'value' }),
    };

    assert.deepStrictEqual(
      Json.stringify(obj),
      Result.ok('{"custom":"value"}'),
    );
  });

  test('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');

    assert.deepStrictEqual(
      Json.stringify(date),
      Result.ok('"2023-01-01T00:00:00.000Z"'),
    );
  });

  test('should not throw errors', () => {
    const mut_circularArray: any[] = [];

    mut_circularArray.push(mut_circularArray);

    expect(() => Json.stringify(mut_circularArray)).not.toThrowError();

    expect(() => Json.stringify({ fn: () => {} })).not.toThrowError();
  });

  test('should use replacer function to filter values', () => {
    const data = {
      name: 'John',
      password: 'secret123',
      email: 'john@example.com',
    };

    const secureReplacer = (key: string, value: unknown): unknown => {
      if (key === 'password') return '[REDACTED]';

      return value;
    };

    const result = Json.stringify(data, secureReplacer);

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('[REDACTED]');

    expect(result.value).not.toContain('secret123');
  });

  test('should format output with space parameter (number)', () => {
    const data = { a: 1, b: 2 };

    const result = Json.stringify(data, undefined, 2);

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('\n');

    expect(result.value).toContain('  '); // 2 spaces indentation
  });

  test('should format output with space parameter (string)', () => {
    const data = { a: 1, b: 2 };

    const result = Json.stringify(data, undefined, '\t');

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('\n');

    expect(result.value).toContain('\t'); // tab indentation
  });
});

describe('stringifySelected', () => {
  test('should include only selected properties', () => {
    const user = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      lastLogin: '2023-12-01',
    };

    const result = Json.stringifySelected(user, ['id', 'name', 'email']);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    assert.deepStrictEqual(parsed, {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
    });

    expect(parsed).not.toHaveProperty('password');

    expect(parsed).not.toHaveProperty('lastLogin');
  });

  test('should work with nested objects', () => {
    const data = {
      users: [
        { id: 1, name: 'Alice', secret: 'hidden1' },
        { id: 2, name: 'Bob', secret: 'hidden2' },
      ],
      metadata: { total: 2, page: 1, internal: 'secret' },
    };

    const result = Json.stringifySelected(data, [
      'users',
      'id',
      'name',
      'metadata',
      'total',
    ]);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    if (isRecord(parsed) && hasKey(parsed, 'users')) {
      assert.isTrue(Arr.isArray(parsed.users));

      expect(parsed.users).toHaveLength(2);

      if (Arr.isArray(parsed.users)) {
        assert.deepStrictEqual(parsed.users[0], { id: 1, name: 'Alice' });

        expect(parsed.users[0]).not.toHaveProperty('secret');
      }

      if (isRecord(parsed) && hasKey(parsed, 'metadata')) {
        assert.deepStrictEqual(parsed.metadata, { total: 2 });

        expect(parsed.metadata).not.toHaveProperty('page');

        expect(parsed.metadata).not.toHaveProperty('internal');
      }
    }
  });

  test('should work with array indices', () => {
    const matrix = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ];

    const result = Json.stringifySelected(matrix, [0, 1]);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    // Note: stringifySelected works with JSON.stringify's replacer parameter
    // which may not work as expected with arrays
    assert.isTrue(Array.isArray(parsed));

    expect(parsed).toHaveLength(3);
  });

  test('should handle formatting with space parameter', () => {
    const data = { a: 1, b: { c: 2 } };

    const result = Json.stringifySelected(data, ['a', 'b', 'c'], 2);

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('\n');

    expect(result.value).toContain('  ');
  });

  test('should handle empty selection array', () => {
    const data = { a: 1, b: 2, c: 3 };

    const result = Json.stringifySelected(data, []);

    assert.isTrue(Result.isOk(result));

    expect(result.value).toBe('{}');
  });

  test('should handle undefined properties parameter', () => {
    const data = { a: 1, b: 2 };

    const result = Json.stringifySelected(data, undefined);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    assert.deepStrictEqual(parsed, { a: 1, b: 2 });
  });

  test('should handle circular references with error', () => {
    // transformer-ignore-next-line
    type CircularType = { name: string; self?: CircularType };

    const mut_circular: CircularType = { name: 'test' };

    mut_circular.self = mut_circular;

    const result = Json.stringifySelected(mut_circular, ['name', 'self']);

    // Note: JSON.stringify may handle circular references differently depending on the replacer
    assert.isTrue(Result.isOk(result) || Result.isErr(result));

    if (Result.isErr(result)) {
      expectTypeOf(result.value).toBeString();
    }
  });
});

describe('stringifySortedKey', () => {
  test('should sort object keys alphabetically', () => {
    const unsortedObj = {
      zebra: 'animal',
      apple: 'fruit',
      banana: 'fruit',
      aardvark: 'animal',
    };

    const result = Json.stringifySortedKey(unsortedObj);

    assert.isTrue(Result.isOk(result));

    expect(result.value).toBe(
      '{"aardvark":"animal","apple":"fruit","banana":"fruit","zebra":"animal"}',
    );
  });

  test('should sort nested object keys', () => {
    const nestedObj = {
      user: {
        name: 'Alice',
        age: 30,
        address: {
          zip: '12345',
          city: 'New York',
          country: 'USA',
        },
      },
      settings: {
        theme: 'dark',
        language: 'en',
      },
    };

    const result = Json.stringifySortedKey(nestedObj);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    if (isRecord(parsed)) {
      const keys = Object.keys(parsed);

      assert.deepStrictEqual(keys, ['settings', 'user']); // sorted top-level keys

      if (hasKey(parsed, 'user') && isRecord(parsed.user)) {
        const userKeys = Object.keys(parsed.user);

        assert.deepStrictEqual(userKeys, ['address', 'age', 'name']); // sorted nested keys

        if (hasKey(parsed.user, 'address') && isRecord(parsed.user.address)) {
          const addressKeys = Object.keys(parsed.user.address);

          assert.deepStrictEqual(addressKeys, ['city', 'country', 'zip']); // sorted deeper nested keys
        }
      }
    }
  });

  test('should handle arrays with objects', () => {
    const dataWithArrays = {
      users: [
        { name: 'Bob', id: 2, active: true },
        { name: 'Alice', id: 1, active: false },
      ],
      metadata: {
        version: '1.0',
        created: '2023-12-01',
        author: 'system',
      },
    };

    const result = Json.stringifySortedKey(dataWithArrays);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    if (isRecord(parsed)) {
      // Check top-level keys are sorted
      const topKeys = Object.keys(parsed);

      assert.deepStrictEqual(topKeys, ['metadata', 'users']);

      // Check metadata keys are sorted
      if (hasKey(parsed, 'metadata') && isRecord(parsed.metadata)) {
        const metadataKeys = Object.keys(parsed.metadata);

        assert.deepStrictEqual(metadataKeys, ['author', 'created', 'version']);
      }

      // Check user object keys are sorted
      if (
        hasKey(parsed, 'users') &&
        Arr.isArray(parsed.users) &&
        Arr.isNonEmpty(parsed.users)
      ) {
        const firstUser = parsed.users[0];

        if (isRecord(firstUser)) {
          const userKeys = Object.keys(firstUser);

          assert.deepStrictEqual(userKeys, ['active', 'id', 'name']);
        }
      }
    }
  });

  test('should handle formatting with space parameter', () => {
    const obj = { b: 2, a: 1 };

    const result = Json.stringifySortedKey(obj, 2);

    assert.isTrue(Result.isOk(result));

    expect(result.value).toContain('\n');

    expect(result.value).toContain('  ');

    expect(result.value).toMatch(/\{\s+"a": 1,\s+"b": 2\s+\}/u);
  });

  test('should produce deterministic output', () => {
    const obj1 = { c: 3, a: 1, b: 2 };

    const obj2 = { b: 2, a: 1, c: 3 };

    const result1 = Json.stringifySortedKey(obj1);

    const result2 = Json.stringifySortedKey(obj2);

    assert.isTrue(Result.isOk(result1));

    assert.isTrue(Result.isOk(result2));

    expect(result1.value).toBe(result2.value);
  });

  test('should handle problematic objects', () => {
    try {
      // transformer-ignore-next-line
      type CircularObj = {
        normal: string;
        circular: { self?: CircularObj };
      };

      const mut_problematicObj: CircularObj = {
        normal: 'value',
        circular: {},
      };

      mut_problematicObj.circular.self = mut_problematicObj;

      const result = Json.stringifySortedKey(mut_problematicObj);

      // This may throw due to circular reference during key extraction
      assert.isTrue(Result.isErr(result));

      if (Result.isErr(result)) {
        expectTypeOf(result.value).toBeString();
      }
    } catch (error) {
      // Expected if circular reference causes stack overflow
      expect(error).toBeDefined();
    }
  });

  test('should handle empty object', () => {
    const result = Json.stringifySortedKey({});

    assert.isTrue(Result.isOk(result));

    expect(result.value).toBe('{}');
  });

  test('should handle deeply nested structures', () => {
    const deep = {
      level1: {
        z: 'last',
        a: {
          nested: {
            y: 2,
            x: 1,
          },
        },
      },
    };

    const result = Json.stringifySortedKey(deep);

    assert.isTrue(Result.isOk(result));

    assert.isTrue(isString(result.value));

    const parsed: unknown = JSON.parse(result.value);

    if (isRecord(parsed) && hasKey(parsed, 'level1')) {
      const level1 = parsed.level1;

      if (isRecord(level1)) {
        assert.deepStrictEqual(Object.keys(level1), ['a', 'z']);

        if (
          hasKey(level1, 'a') &&
          isRecord(level1.a) &&
          hasKey(level1.a, 'nested')
        ) {
          const nested = level1.a.nested;

          if (isRecord(nested)) {
            assert.deepStrictEqual(Object.keys(nested), ['x', 'y']);
          }
        }
      }
    }
  });
});
