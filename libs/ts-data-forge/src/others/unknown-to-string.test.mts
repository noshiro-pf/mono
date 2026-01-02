import dedent from 'dedent';
import { unknownToString } from './unknown-to-string.mjs';

describe(unknownToString, () => {
  test('string', () => {
    const value = 'aaaaa';

    expect(unknownToString(value)).toBe('aaaaa');

    expect(JSON.stringify(value)).toBe('"aaaaa"');
  });

  test('number', () => {
    expect(unknownToString(1)).toBe('1');

    expect(JSON.stringify(1)).toBe('1');
  });

  test('BigInt value', () => {
    const value = 123n;

    expect(unknownToString(value)).toBe('123n');

    expect(() => JSON.stringify(value)).toThrowError(
      'Do not know how to serialize a BigInt',
    );
  });

  test('boolean', () => {
    expect(unknownToString(true)).toBe('true');

    expect(JSON.stringify(true)).toBe('true');
  });

  test('undefined', () => {
    expect(unknownToString(undefined)).toBe('undefined');

    expect(JSON.stringify(undefined)).toBeUndefined();
  });

  test('null', () => {
    expect(unknownToString(null)).toBe('null');

    expect(JSON.stringify(null)).toBe('null');
  });

  test('symbol', () => {
    const value = Symbol('sym');

    expect(unknownToString(value)).toBe('Symbol(sym)');

    expect(JSON.stringify(value)).toBeUndefined();
  });

  describe('function', () => {
    test('() => 0', () => {
      const fn = (): number => 0;

      expect(unknownToString(fn)).toBe('() => 0');

      expect(JSON.stringify(fn)).toBeUndefined();
    });

    test('(args) => ({ ret: args })', () => {
      const fn = (args: unknown): unknown => ({ ret: args });

      expect(unknownToString(fn)).toBe('(args) => ({ ret: args })');

      expect(JSON.stringify(fn)).toBeUndefined();
    });
  });

  describe('object', () => {
    test('object', () => {
      const obj = { a: { b: 1 } };

      expect(unknownToString(obj)).toBe('{"a":{"b":1}}');

      expect(JSON.stringify(obj)).toBe('{"a":{"b":1}}');
    });

    test('object(prettyPrint=true)', () => {
      const obj = { a: { b: 1 } };

      expect(unknownToString(obj, { prettyPrintObject: true })).toBe(
        dedent`
          {
            "a": {
              "b": 1
            }
          }
        `,
      );
    });

    describe('array', () => {
      test('array of primitives', () => {
        const arr = [1, 2, 3, 'test', true];

        expect(unknownToString(arr)).toBe('[1,2,3,"test",true]');

        expect(JSON.stringify(arr)).toBe('[1,2,3,"test",true]');
      });

      test('array of objects', () => {
        const arr = [{ a: 1 }, { b: 2 }];

        expect(unknownToString(arr)).toBe('[{"a":1},{"b":2}]');

        expect(JSON.stringify(arr)).toBe('[{"a":1},{"b":2}]');
      });

      test('empty array', () => {
        expect(unknownToString([])).toBe('[]');

        expect(JSON.stringify([])).toBe('[]');
      });

      test('nested array', () => {
        const nestedArray = [
          [1, 2],
          [3, 4],
        ];

        expect(unknownToString(nestedArray)).toBe('[[1,2],[3,4]]');

        expect(JSON.stringify(nestedArray)).toBe('[[1,2],[3,4]]');
      });

      test('array with prettyPrint', () => {
        const arr = [1, { a: 2 }, 3];

        expect(
          unknownToString(arr, {
            prettyPrintObject: true,
          }),
        ).toBe(
          dedent`
            [
              1,
              {
                "a": 2
              },
              3
            ]
          `,
        );
      });
    });

    describe('special objects', () => {
      test('Date object returns ISO string', () => {
        const date = new Date('2024-01-15T10:30:00.000Z');

        expect(unknownToString(date)).toBe('2024-01-15T10:30:00.000Z');
      });

      test('RegExp returns regex literal', () => {
        const regex = /test/giu;

        expect(unknownToString(regex)).toBe('/test/giu');
      });

      test('RegExp without flags', () => {
        // eslint-disable-next-line require-unicode-regexp
        const regex = /hello/;

        expect(unknownToString(regex)).toBe('/hello/');
      });

      test('Map with entries', () => {
        const map = new Map<number | string, boolean | number | string>([
          ['key1', 'value1'],
          ['key2', 42],
          [3, true],
        ]);

        expect(unknownToString(map)).toBe(
          'Map([["key1","value1"],["key2",42],[3,true]])',
        );
      });

      test('empty Map', () => {
        const map = new Map();

        expect(unknownToString(map)).toBe('Map([])');
      });

      test('Map with prettyPrint', () => {
        const map = new Map([
          ['a', 1],
          ['b', 2],
        ]);

        expect(unknownToString(map, { prettyPrintObject: true })).toBe(
          dedent`
            Map([
              [
                "a",
                1
              ],
              [
                "b",
                2
              ]
            ])
          `,
        );
      });

      test('Set with values', () => {
        const set = new Set([1, 2, 3, 'test', true]);

        expect(unknownToString(set)).toBe('Set([1,2,3,"test",true])');
      });

      test('empty Set', () => {
        const set = new Set();

        expect(unknownToString(set)).toBe('Set([])');
      });

      test('Set with prettyPrint', () => {
        const set = new Set([1, { a: 2 }, 3]);

        expect(unknownToString(set, { prettyPrintObject: true })).toBe(
          dedent`
            Set([
              1,
              {
                "a": 2
              },
              3
            ])
          `,
        );
      });

      test('nested Map and Set', () => {
        const map = new Map([['set', new Set([1, 2])]]);

        const result = unknownToString(map);

        // Set is converted to object notation in JSON.stringify
        expect(result).toMatch(/Map\(\[\["set",/u);
      });

      test('Error object returns message', () => {
        const err = new Error('Something went wrong');

        expect(unknownToString(err)).toBe('Something went wrong');

        expect(JSON.stringify(err)).toBe('{}');
      });

      test('Error object with empty message', () => {
        // eslint-disable-next-line unicorn/error-message
        const err = new Error('');

        expect(unknownToString(err)).toBe('');

        expect(JSON.stringify(err)).toBe('{}');
      });

      test('TypeError object with empty message', () => {
        // eslint-disable-next-line unicorn/error-message
        const err = new TypeError('');

        expect(unknownToString(err)).toBe('');
      });
    });
  });

  test('circular reference returns error message', () => {
    const mut_circular: { a: number; self?: unknown } = { a: 1 };

    mut_circular.self = mut_circular;

    // Should return an error message string instead of throwing
    expectTypeOf(unknownToString(mut_circular)).toBeString();

    expect(unknownToString(mut_circular)).toMatch(/circular|serialize/iu);
  });

  test('non-Error thrown during serialization returns fallback text', () => {
    const value = {
      toJSON: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'custom failure';
      },
    };

    expect(unknownToString(value)).toBe('[Circular or Non-serializable]');
  });
});
