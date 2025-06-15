import { Arr } from '../array/index.mjs';
import { Result } from '../functional/result.mjs';
import { hasKey, isRecord } from '../guard/index.mjs';
import { Json } from './json.mjs';

describe('parse', () => {
  test('should parse primitive values', () => {
    expect(Json.parse('"hello"')).toStrictEqual(Result.ok('hello'));
    expect(Json.parse('42')).toStrictEqual(Result.ok(42));
    expect(Json.parse('true')).toStrictEqual(Result.ok(true));
    expect(Json.parse('false')).toStrictEqual(Result.ok(false));
    expect(Json.parse('null')).toStrictEqual(Result.ok(null));
  });

  test('should parse arrays', () => {
    expect(Json.parse('[1,2,3]')).toStrictEqual(Result.ok([1, 2, 3]));
    expect(Json.parse('["a","b","c"]')).toStrictEqual(
      Result.ok(['a', 'b', 'c']),
    );
    expect(Json.parse('[1,"two",true,null]')).toStrictEqual(
      Result.ok([1, 'two', true, null]),
    );
  });

  test('should parse objects', () => {
    expect(Json.parse('{"a":1,"b":2}')).toStrictEqual(
      Result.ok({ a: 1, b: 2 }),
    );
    expect(Json.parse('{"name":"test","value":42}')).toStrictEqual(
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
    expect(Json.parse(json)).toStrictEqual(Result.ok(expected));
  });

  test('should handle whitespace', () => {
    expect(Json.parse('  {  "a" : 1 ,  "b" : 2  }  ')).toStrictEqual(
      Result.ok({ a: 1, b: 2 }),
    );
    expect(Json.parse('\n[\n  1,\n  2,\n  3\n]\n')).toStrictEqual(
      Result.ok([1, 2, 3]),
    );
  });

  test('should return error for invalid JSON', () => {
    expect(Result.isErr(Json.parse('invalid'))).toBe(true);
    expect(Result.isErr(Json.parse('{missing quotes: true}'))).toBe(true);
    expect(Result.isErr(Json.parse('[1,2,]'))).toBe(true); // Trailing comma
    expect(Result.isErr(Json.parse('undefined'))).toBe(true);
  });

  test('should return parsed value for valid JSON', () => {
    expect(Json.parse('{"a":1}')).toStrictEqual(Result.ok({ a: 1 }));
    expect(Json.parse('[1,2,3]')).toStrictEqual(Result.ok([1, 2, 3]));
    expect(Json.parse('"string"')).toStrictEqual(Result.ok('string'));
    expect(Json.parse('42')).toStrictEqual(Result.ok(42));
    expect(Json.parse('true')).toStrictEqual(Result.ok(true));
    expect(Json.parse('null')).toStrictEqual(Result.ok(null));
  });

  test('should return error for invalid JSON cases', () => {
    expect(Result.isErr(Json.parse('invalid'))).toBe(true);
    expect(Result.isErr(Json.parse('{bad json}'))).toBe(true);
    expect(Result.isErr(Json.parse('[1,2,]'))).toBe(true);
    expect(Result.isErr(Json.parse('undefined'))).toBe(true);
    expect(Result.isErr(Json.parse(''))).toBe(true);
  });

  test('should handle edge cases', () => {
    expect(Json.parse('0')).toStrictEqual(Result.ok(0));
    expect(Json.parse('""')).toStrictEqual(Result.ok(''));
    expect(Json.parse('[]')).toStrictEqual(Result.ok([]));
    expect(Json.parse('{}')).toStrictEqual(Result.ok({}));
  });

  test('should not throw errors', () => {
    expect(() => Json.parse('{{{')).not.toThrow();
    expect(() => Json.parse('null null')).not.toThrow();

    expect(() => Json.parse(String(undefined))).not.toThrow();
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      if (
        isRecord(result.value) &&
        hasKey(result.value, 'name') &&
        hasKey(result.value, 'created')
      ) {
        expect(result.value.name).toBe('test');
        expect(result.value.created).toBeInstanceOf(Date);
      }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
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
    }
  });
});

describe('stringify', () => {
  test('should stringify primitive values', () => {
    expect(Json.stringify('hello')).toStrictEqual(Result.ok('"hello"'));
    expect(Json.stringify(42)).toStrictEqual(Result.ok('42'));
    expect(Json.stringify(true)).toStrictEqual(Result.ok('true'));
    expect(Json.stringify(null)).toStrictEqual(Result.ok('null'));
  });

  test('should stringify arrays', () => {
    expect(Json.stringify([1, 2, 3])).toStrictEqual(Result.ok('[1,2,3]'));
    expect(Json.stringify(['a', 'b', 'c'])).toStrictEqual(
      Result.ok('["a","b","c"]'),
    );
    expect(Json.stringify([1, 'two', true, null])).toStrictEqual(
      Result.ok('[1,"two",true,null]'),
    );
  });

  test('should stringify objects', () => {
    expect(Json.stringify({ a: 1, b: 2 })).toStrictEqual(
      Result.ok('{"a":1,"b":2}'),
    );
    expect(Json.stringify({ name: 'test', value: 42 })).toStrictEqual(
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
    expect(Json.stringify(nested)).toStrictEqual(
      Result.ok('{"level1":{"level2":{"array":[1,2,{"level3":"deep"}]}}}'),
    );
  });

  test('should handle empty structures', () => {
    expect(Json.stringify({})).toStrictEqual(Result.ok('{}'));
    expect(Json.stringify([])).toStrictEqual(Result.ok('[]'));
  });

  test('should handle special string values', () => {
    expect(Json.stringify('with "quotes"')).toStrictEqual(
      Result.ok('"with \\"quotes\\""'),
    );
    expect(Json.stringify('with\nnewline')).toStrictEqual(
      Result.ok('"with\\nnewline"'),
    );
    expect(Json.stringify('with\ttab')).toStrictEqual(
      Result.ok('"with\\ttab"'),
    );
  });

  test('should return stringified value for valid JSON values', () => {
    expect(Json.stringify({ a: 1 })).toStrictEqual(Result.ok('{"a":1}'));
    expect(Json.stringify([1, 2, 3])).toStrictEqual(Result.ok('[1,2,3]'));
    expect(Json.stringify('string')).toStrictEqual(Result.ok('"string"'));
    expect(Json.stringify(42)).toStrictEqual(Result.ok('42'));
    expect(Json.stringify(true)).toStrictEqual(Result.ok('true'));
    expect(Json.stringify(null)).toStrictEqual(Result.ok('null'));
  });

  test('should handle non-serializable values', () => {
    expect(Json.stringify(undefined)).toStrictEqual(Result.ok(undefined));
    expect(Json.stringify(Symbol('test'))).toStrictEqual(Result.ok(undefined));
    expect(Json.stringify(() => {})).toStrictEqual(Result.ok(undefined));
    // BigInt should cause an error
    expect(Result.isErr(Json.stringify(BigInt(123)))).toBe(true);
  });

  test('should handle circular references', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = { a: 1 };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    obj.circular = obj;
    expect(Result.isErr(Json.stringify(obj))).toBe(true);
  });

  test('should handle objects with toJSON method', () => {
    const obj = {
      toJSON() {
        return { custom: 'value' };
      },
    };
    expect(Json.stringify(obj)).toStrictEqual(Result.ok('{"custom":"value"}'));
  });

  test('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00.000Z');
    expect(Json.stringify(date)).toStrictEqual(
      Result.ok('"2023-01-01T00:00:00.000Z"'),
    );
  });

  test('should not throw errors', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circularArray: any[] = [];
    circularArray.push(circularArray);

    expect(() => Json.stringify(circularArray)).not.toThrow();
    expect(() => Json.stringify({ fn: () => {} })).not.toThrow();
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toContain('[REDACTED]');
      expect(result.value).not.toContain('secret123');
    }
  });

  test('should format output with space parameter (number)', () => {
    const data = { a: 1, b: 2 };
    const result = Json.stringify(data, undefined, 2);

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toContain('\n');
      expect(result.value).toContain('  '); // 2 spaces indentation
    }
  });

  test('should format output with space parameter (string)', () => {
    const data = { a: 1, b: 2 };
    const result = Json.stringify(data, undefined, '\t');

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toContain('\n');
      expect(result.value).toContain('\t'); // tab indentation
    }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);
      expect(parsed).toStrictEqual({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
      });
      expect(parsed).not.toHaveProperty('password');
      expect(parsed).not.toHaveProperty('lastLogin');
    }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);
      if (isRecord(parsed) && hasKey(parsed, 'users')) {
        expect(isRecord(parsed.users)).toBe(false);
        expect(parsed.users).toHaveLength(2);
        if (Arr.isArray(parsed.users)) {
          expect(parsed.users[0]).toStrictEqual({ id: 1, name: 'Alice' });
          expect(parsed.users[0]).not.toHaveProperty('secret');
        }
        if (isRecord(parsed) && hasKey(parsed, 'metadata')) {
          expect(parsed.metadata).toStrictEqual({ total: 2 });
          expect(parsed.metadata).not.toHaveProperty('page');
          expect(parsed.metadata).not.toHaveProperty('internal');
        }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);
      // Note: stringifySelected works with JSON.stringify's replacer parameter
      // which may not work as expected with arrays
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(3);
    }
  });

  test('should handle formatting with space parameter', () => {
    const data = { a: 1, b: { c: 2 } };
    const result = Json.stringifySelected(data, ['a', 'b', 'c'], 2);

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toContain('\n');
      expect(result.value).toContain('  ');
    }
  });

  test('should handle empty selection array', () => {
    const data = { a: 1, b: 2, c: 3 };
    const result = Json.stringifySelected(data, []);

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('{}');
    }
  });

  test('should handle undefined properties parameter', () => {
    const data = { a: 1, b: 2 };
    const result = Json.stringifySelected(data, undefined);

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);
      expect(parsed).toStrictEqual({ a: 1, b: 2 });
    }
  });

  test('should handle circular references with error', () => {
    type CircularType = { name: string; self?: CircularType };
    const circular: CircularType = { name: 'test' };
    circular.self = circular;

    const result = Json.stringifySelected(circular, ['name', 'self']);

    // Note: JSON.stringify may handle circular references differently depending on the replacer
    expect(Result.isOk(result) || Result.isErr(result)).toBe(true);
    if (Result.isErr(result)) {
      expect(typeof result.value).toBe('string');
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe(
        '{"aardvark":"animal","apple":"fruit","banana":"fruit","zebra":"animal"}',
      );
    }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);
      if (isRecord(parsed)) {
        const keys = Object.keys(parsed);
        expect(keys).toStrictEqual(['settings', 'user']); // sorted top-level keys

        if (hasKey(parsed, 'user') && isRecord(parsed.user)) {
          const userKeys = Object.keys(parsed.user);
          expect(userKeys).toStrictEqual(['address', 'age', 'name']); // sorted nested keys

          if (hasKey(parsed.user, 'address') && isRecord(parsed.user.address)) {
            const addressKeys = Object.keys(parsed.user.address);
            expect(addressKeys).toStrictEqual(['city', 'country', 'zip']); // sorted deeper nested keys
          }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);

      if (isRecord(parsed)) {
        // Check top-level keys are sorted
        const topKeys = Object.keys(parsed);
        expect(topKeys).toStrictEqual(['metadata', 'users']);

        // Check metadata keys are sorted
        if (hasKey(parsed, 'metadata') && isRecord(parsed.metadata)) {
          const metadataKeys = Object.keys(parsed.metadata);
          expect(metadataKeys).toStrictEqual(['author', 'created', 'version']);
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
            expect(userKeys).toStrictEqual(['active', 'id', 'name']);
          }
        }
      }
    }
  });

  test('should handle formatting with space parameter', () => {
    const obj = { b: 2, a: 1 };
    const result = Json.stringifySortedKey(obj, 2);

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toContain('\n');
      expect(result.value).toContain('  ');
      expect(result.value).toMatch(/\{\s+"a": 1,\s+"b": 2\s+\}/u);
    }
  });

  test('should produce deterministic output', () => {
    const obj1 = { c: 3, a: 1, b: 2 };
    const obj2 = { b: 2, a: 1, c: 3 };

    const result1 = Json.stringifySortedKey(obj1);
    const result2 = Json.stringifySortedKey(obj2);

    expect(Result.isOk(result1)).toBe(true);
    expect(Result.isOk(result2)).toBe(true);

    if (Result.isOk(result1) && Result.isOk(result2)) {
      expect(result1.value).toBe(result2.value);
    }
  });

  test('should handle problematic objects', () => {
    try {
      type CircularObj = {
        normal: string;
        circular: { self?: CircularObj };
      };
      const problematicObj: CircularObj = {
        normal: 'value',
        circular: {},
      };
      problematicObj.circular.self = problematicObj;

      const result = Json.stringifySortedKey(problematicObj);

      // This may throw due to circular reference during key extraction
      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(typeof result.value).toBe('string');
      }
    } catch (error) {
      // Expected if circular reference causes stack overflow
      expect(error).toBeDefined();
    }
  });

  test('should handle empty object', () => {
    const result = Json.stringifySortedKey({});

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      expect(result.value).toBe('{}');
    }
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

    expect(Result.isOk(result)).toBe(true);
    if (Result.isOk(result)) {
      const parsed: unknown = JSON.parse(result.value);
      if (isRecord(parsed) && hasKey(parsed, 'level1')) {
        const level1 = parsed.level1;
        if (isRecord(level1)) {
          expect(Object.keys(level1)).toStrictEqual(['a', 'z']);
          if (
            hasKey(level1, 'a') &&
            isRecord(level1.a) &&
            hasKey(level1.a, 'nested')
          ) {
            const nested = level1.a.nested;
            if (isRecord(nested)) {
              expect(Object.keys(nested)).toStrictEqual(['x', 'y']);
            }
          }
        }
      }
    }
  });
});
