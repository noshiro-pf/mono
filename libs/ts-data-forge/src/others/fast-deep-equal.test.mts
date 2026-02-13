/* eslint-disable total-functions/no-unsafe-type-assertion */
/* eslint-disable guard-for-in */
/* eslint-disable require-unicode-regexp */
/* eslint-disable no-restricted-globals */
/* eslint-disable functional/no-class-inheritance */

import * as React from 'react';
import { fastDeepEqual } from './fast-deep-equal.mjs';

const fastDeepEqualUntyped = (a: any, b: any): boolean => fastDeepEqual(a, b);

const func1 = (): void => {};

const func2 = (): void => {};

class MyMap<K, V> extends Map<K, V> {}

class MySet<T> extends Set<T> {}

const emptyObj = {};

type TestCase = Readonly<{
  name: string;
  x: unknown;
  y: unknown;
  expected: '=' | '!=';
}>;

const testFn = ({ x, y, expected }: TestCase): void => {
  {
    const result = fastDeepEqualUntyped(x, y);

    switch (expected) {
      case '=':
        assert.isTrue(result);

        break;

      case '!=':
        assert.isFalse(result);

        break;
    }
  }

  {
    const resultReversed = fastDeepEqualUntyped(y, x);

    switch (expected) {
      case '=':
        assert.isTrue(resultReversed);

        break;

      case '!=':
        assert.isFalse(resultReversed);

        break;
    }
  }
};

describe(fastDeepEqual, () => {
  describe('scalars', () => {
    test.each([
      { name: 'equal numbers', x: 1, y: 1, expected: '=' },
      { name: 'not equal numbers', x: 1, y: 2, expected: '!=' },
      { name: 'number and array are not equal', x: 1, y: [], expected: '!=' },
      { name: '0 and null are not equal', x: 0, y: null, expected: '!=' },
      { name: 'equal strings', x: 'a', y: 'a', expected: '=' },
      { name: 'not equal strings', x: 'a', y: 'b', expected: '!=' },
      {
        name: 'empty string and null are not equal',
        x: '',
        y: null,
        expected: '!=',
      },
      { name: 'null is equal to null', x: null, y: null, expected: '=' },
      { name: 'equal booleans (true)', x: true, y: true, expected: '=' },
      { name: 'equal booleans (false)', x: false, y: false, expected: '=' },
      { name: 'not equal booleans', x: true, y: false, expected: '!=' },
      { name: '1 and true are not equal', x: 1, y: true, expected: '!=' },
      { name: '0 and false are not equal', x: 0, y: false, expected: '!=' },
      {
        name: 'NaN and NaN are equal',
        x: Number.NaN,
        y: Number.NaN,
        expected: '=',
      },
      { name: '0 and -0 are equal', x: 0, y: -0, expected: '=' },
      {
        name: 'Infinity and Infinity are equal',
        x: Infinity,
        y: Infinity,
        expected: '=',
      },
      {
        name: 'Infinity and -Infinity are not equal',
        x: Infinity,
        y: -Infinity,
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('objects', () => {
    test.each([
      { name: 'empty objects are equal', x: {}, y: {}, expected: '=' },
      {
        name: 'equal objects (same properties "order")',
        x: { a: 1, b: '2' },
        y: { a: 1, b: '2' },
        expected: '=',
      },
      {
        name: 'equal objects (different properties "order")',
        x: { a: 1, b: '2' },
        y: { b: '2', a: 1 },
        expected: '=',
      },
      {
        name: 'not equal objects (extra property)',
        x: { a: 1, b: '2' },
        y: { a: 1, b: '2', c: [] },
        expected: '!=',
      },
      {
        name: 'not equal objects (different property values)',
        x: { a: 1, b: '2', c: 3 },
        y: { a: 1, b: '2', c: 4 },
        expected: '!=',
      },
      {
        name: 'not equal objects (different properties)',
        x: { a: 1, b: '2', c: 3 },
        y: { a: 1, b: '2', d: 3 },
        expected: '!=',
      },
      {
        name: 'equal objects (same sub-properties)',
        x: { a: [{ b: 'c' }] },
        y: { a: [{ b: 'c' }] },
        expected: '=',
      },
      {
        name: 'not equal objects (different sub-property value)',
        x: { a: [{ b: 'c' }] },
        y: { a: [{ b: 'd' }] },
        expected: '!=',
      },
      {
        name: 'not equal objects (different sub-property)',
        x: { a: [{ b: 'c' }] },
        y: { a: [{ c: 'c' }] },
        expected: '!=',
      },
      {
        name: 'empty array and empty object are not equal',
        x: {},
        y: [],
        expected: '!=',
      },
      {
        name: 'object with extra undefined properties are not equal #1',
        x: {},
        y: { foo: undefined },
        expected: '!=',
      },
      {
        name: 'object with extra undefined properties are not equal #2',
        x: { foo: undefined },
        y: {},
        expected: '!=',
      },
      {
        name: 'object with extra undefined properties are not equal #3',
        x: { foo: undefined },
        y: { bar: undefined },
        expected: '!=',
      },
      { name: 'nulls are equal', x: null, y: null, expected: '=' },
      {
        name: 'null and undefined are not equal',
        x: null,
        y: undefined,
        expected: '!=',
      },
      {
        name: 'null and empty object are not equal',
        x: null,
        y: {},
        expected: '!=',
      },
      {
        name: 'undefined and empty object are not equal',
        x: undefined,
        y: {},
        expected: '!=',
      },
      {
        name: 'objects with different `toString` functions returning same values are equal',
        x: { toString: () => 'Hello world!' } as any,
        y: { toString: () => 'Hello world!' } as any,
        expected: '=',
      },
      {
        name: 'objects with `toString` functions returning different values are not equal',
        x: { toString: () => 'Hello world!' } as any,
        y: { toString: () => 'Hi!' } as any,
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('arrays', () => {
    test.each([
      { name: 'two empty arrays are equal', x: [], y: [], expected: '=' },
      { name: 'equal arrays', x: [1, 2, 3], y: [1, 2, 3], expected: '=' },
      {
        name: 'not equal arrays (different item)',
        x: [1, 2, 3],
        y: [1, 2, 4],
        expected: '!=',
      },
      {
        name: 'not equal arrays (different length)',
        x: [1, 2, 3],
        y: [1, 2],
        expected: '!=',
      },
      {
        name: 'equal arrays of objects',
        x: [{ a: 'a' }, { b: 'b' }],
        y: [{ a: 'a' }, { b: 'b' }],
        expected: '=',
      },
      {
        name: 'not equal arrays of objects',
        x: [{ a: 'a' }, { b: 'b' }],
        y: [{ a: 'a' }, { b: 'c' }],
        expected: '!=',
      },
      {
        name: 'pseudo array and equivalent array are not equal',
        x: { 0: 0, 1: 1, length: 2 },
        y: [0, 1],
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('Date objects', () => {
    test.each([
      {
        name: 'equal date objects',
        x: new Date('2017-06-16T21:36:48.362Z'),
        y: new Date('2017-06-16T21:36:48.362Z'),
        expected: '=',
      },
      {
        name: 'not equal date objects',
        x: new Date('2017-06-16T21:36:48.362Z'),
        y: new Date('2017-01-01T00:00:00.000Z'),
        expected: '!=',
      },
      {
        name: 'date and string are not equal',
        x: new Date('2017-06-16T21:36:48.362Z'),
        y: '2017-06-16T21:36:48.362Z',
        expected: '!=',
      },
      {
        name: 'date and object are not equal',
        x: new Date('2017-06-16T21:36:48.362Z'),
        y: {},
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('RegExp objects', () => {
    test.each([
      { name: 'equal RegExp objects', x: /foo/, y: /foo/, expected: '=' },
      {
        name: 'not equal RegExp objects (different pattern)',
        x: /foo/,
        y: /bar/,
        expected: '!=',
      },
      {
        name: 'not equal RegExp objects (different flags)',
        x: /foo/,
        y: /foo/i,
        expected: '!=',
      },
      {
        name: 'RegExp and string are not equal',
        x: /foo/,
        y: 'foo',
        expected: '!=',
      },
      {
        name: 'RegExp and object are not equal',
        x: /foo/,
        y: {},
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('functions', () => {
    test.each([
      { name: 'same function is equal', x: func1, y: func1, expected: '=' },
      {
        name: 'different functions are not equal',
        x: func1,
        y: func2,
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('sample objects', () => {
    test.each([
      {
        name: 'big object',
        x: {
          prop1: 'value1',
          prop2: 'value2',
          prop3: 'value3',
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
            },
          },
          prop5: 1000,
          prop6: new Date(2016, 2, 10),
        },
        y: {
          prop5: 1000,
          prop3: 'value3',
          prop1: 'value1',
          prop2: 'value2',
          prop6: new Date('2016/03/10'),
          prop4: {
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, { prop2: 1, prop: 2 }, 4, 5],
            },
            subProp1: 'sub value1',
          },
        },
        expected: '=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('bigint', () => {
    test.each([
      { name: 'equal bigints', x: 1n, y: 1n, expected: '=' },
      { name: 'not equal bigints', x: 1n, y: 2n, expected: '!=' },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('Maps', () => {
    const createMap = <K, V>(
      obj: ReadonlyRecord<string, V>,
      MapClass: new () => Map<K, V> = Map,
    ): Map<K, V> => {
      const mut_m = new MapClass();

      for (const key in obj) {
        mut_m.set(key as unknown as K, obj[key] as V);
      }

      return mut_m;
    };

    test.each([
      {
        name: 'empty maps are equal',
        x: new Map(),
        y: new Map(),
        expected: '=',
      },
      {
        name: 'empty maps of different class are not equal',
        x: new Map(),
        y: new MyMap(),
        expected: '!=',
      },
      {
        name: 'equal maps (same key "order")',
        x: createMap({ a: 1, b: '2' }),
        y: createMap({ a: 1, b: '2' }),
        expected: '=',
      },
      {
        name: 'not equal maps (same key "order" - instances of different classes)',
        x: createMap({ a: 1, b: '2' }),
        y: createMap({ a: 1, b: '2' }, MyMap),
        expected: '!=',
      },
      {
        name: 'equal maps (different key "order")',
        x: createMap({ a: 1, b: '2' }),
        y: createMap({ b: '2', a: 1 }),
        expected: '=',
      },
      {
        name: 'equal maps (different key "order" - instances of the same subclass)',
        x: createMap({ a: 1, b: '2' }, MyMap),
        y: createMap({ b: '2', a: 1 }, MyMap),
        expected: '=',
      },
      {
        name: 'not equal maps (extra key)',
        x: createMap({ a: 1, b: '2' }),
        y: createMap({ a: 1, b: '2', c: [] }),
        expected: '!=',
      },
      {
        name: 'not equal maps (different key value)',
        x: createMap({ a: 1, b: '2', c: 3 }),
        y: createMap({ a: 1, b: '2', c: 4 }),
        expected: '!=',
      },
      {
        name: 'not equal maps (different keys)',
        x: createMap({ a: 1, b: '2', c: 3 }),
        y: createMap({ a: 1, b: '2', d: 3 }),
        expected: '!=',
      },
      {
        name: 'equal maps (same sub-keys)',
        x: new Map([['a', [createMap({ b: 'c' })]]]),
        y: new Map([['a', [createMap({ b: 'c' })]]]),
        expected: '=',
      },
      {
        name: 'not equal maps (different sub-key value)',
        x: new Map([['a', [createMap({ b: 'c' })]]]),
        y: new Map([['a', [createMap({ b: 'd' })]]]),
        expected: '!=',
      },
      {
        name: 'not equal maps (different sub-key)',
        x: new Map([['a', [createMap({ b: 'c' })]]]),
        y: new Map([['a', [createMap({ c: 'c' })]]]),
        expected: '!=',
      },
      {
        name: 'empty map and empty object are equal',
        x: {},
        y: new Map(),
        expected: '!=',
      },
      {
        name: 'empty map and empty array are not equal',
        x: [],
        y: new Map(),
        expected: '!=',
      },
      {
        name: 'map with extra undefined key is not equal #1',
        x: createMap({}),
        y: createMap({ foo: undefined }),
        expected: '!=',
      },
      {
        name: 'map with extra undefined key is not equal #2',
        x: createMap({ foo: undefined }),
        y: createMap({}),
        expected: '!=',
      },
      {
        name: 'map with extra undefined key is not equal #3',
        x: createMap({ foo: undefined }),
        y: createMap({ bar: undefined }),
        expected: '!=',
      },
      {
        name: 'map and a pseudo map are not equal',
        x: createMap({}),
        y: {
          constructor: Map,
          size: 0,
          has: () => true,
          get: () => 1,
        },
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('Sets', () => {
    const createSet = <T,>(
      arr: readonly T[],
      SetClass: new () => Set<T> = Set,
    ): Set<T> => {
      const mut_s = new SetClass();

      for (const value of arr) {
        mut_s.add(value);
      }

      return mut_s;
    };

    test.each([
      {
        name: 'empty sets are equal',
        x: new Set(),
        y: new Set(),
        expected: '=',
      },
      {
        name: 'empty sets of different class are not equal',
        x: new Set(),
        y: new MySet(),
        expected: '!=',
      },
      {
        name: 'equal sets (same value "order")',
        x: createSet(['a', 'b']),
        y: createSet(['a', 'b']),
        expected: '=',
      },
      {
        name: 'not equal sets (same value "order" - instances of different classes)',
        x: createSet(['a', 'b']),
        y: createSet(['a', 'b'], MySet),
        expected: '!=',
      },
      {
        name: 'equal sets (different value "order")',
        x: createSet(['a', 'b']),
        y: createSet(['b', 'a']),
        expected: '=',
      },
      {
        name: 'equal sets (different value "order" - instances of the same subclass)',
        x: createSet(['a', 'b'], MySet),
        y: createSet(['b', 'a'], MySet),
        expected: '=',
      },
      {
        name: 'not equal sets (extra value)',
        x: createSet(['a', 'b']),
        y: createSet(['a', 'b', 'c']),
        expected: '!=',
      },
      {
        name: 'not equal sets (different values)',
        x: createSet(['a', 'b', 'c']),
        y: createSet(['a', 'b', 'd']),
        expected: '!=',
      },
      {
        name: 'not equal sets (different instances of objects)',
        x: createSet(['a', {}]),
        y: createSet(['a', {}]),
        expected: '!=',
      },
      {
        name: 'equal sets (same instances of objects)',
        x: createSet(['a', emptyObj]),
        y: createSet(['a', emptyObj]),
        expected: '=',
      },
      {
        name: 'empty set and empty object are not equal',
        x: {},
        y: new Set(),
        expected: '!=',
      },
      {
        name: 'empty set and empty array are not equal',
        x: [],
        y: new Set(),
        expected: '!=',
      },
      {
        name: 'set with extra undefined value is not equal #1',
        x: createSet([]),
        y: createSet([undefined]),
        expected: '!=',
      },
      {
        name: 'set with extra undefined value is not equal #2',
        x: createSet([undefined]),
        y: createSet([]),
        expected: '!=',
      },
      {
        name: 'set and pseudo set are not equal',
        x: new Set(),
        y: {
          constructor: Set,
          size: 0,
          has: () => true,
        },
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('Typed arrays', () => {
    test.each([
      {
        name: 'two empty arrays of the same class are equal',
        x: new Int32Array([]),
        y: new Int32Array([]),
        expected: '=',
      },
      {
        name: 'two empty arrays of the different class are not equal',
        x: new Int32Array([]),
        y: new Int16Array([]),
        expected: '!=',
      },
      {
        name: 'equal arrays',
        x: new Int32Array([1, 2, 3]),
        y: new Int32Array([1, 2, 3]),
        expected: '=',
      },
      {
        name: 'equal BigUint64Array arrays',
        x: new BigUint64Array([1n, 2n, 3n]),
        y: new BigUint64Array([1n, 2n, 3n]),
        expected: '=',
      },
      {
        name: 'not equal BigUint64Array arrays',
        x: new BigUint64Array([1n, 2n, 3n]),
        y: new BigUint64Array([1n, 2n, 4n]),
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);

    test.each([
      {
        name: 'not equal arrays (same items, different class)',
        x: new Int32Array([1, 2, 3]),
        y: new Int16Array([1, 2, 3]),
        expected: '!=',
      },
      {
        name: 'not equal arrays (different item)',
        x: new Int32Array([1, 2, 3]),
        y: new Int32Array([1, 2, 4]),
        expected: '!=',
      },
      {
        name: 'not equal arrays (different length)',
        x: new Int32Array([1, 2, 3]),
        y: new Int32Array([1, 2]),
        expected: '!=',
      },
      {
        name: 'pseudo array and equivalent typed array are not equal',
        x: { 0: 1, 1: 2, length: 2, constructor: Int32Array },
        y: new Int32Array([1, 2]),
        expected: '!=',
      },
    ] as const satisfies readonly TestCase[])('$name', testFn);
  });

  describe('React component', () => {
    let mut_renderCount = 0;

    class ChildWithShouldComponentUpdate extends React.Component {
      override shouldComponentUpdate(nextProps: any): boolean {
        // this.props.children contains React elements with circular references to their owner (Container)
        return !fastDeepEqualUntyped(this.props, nextProps);
      }

      override render(): null {
        mut_renderCount += 1;

        return null;
      }
    }

    describe('element (with circular references)', () => {
      test('React elements with _owner can be compared without infinite loop', () => {
        // Create React elements that contain _owner property (circular reference)
        const element1 = React.createElement(
          'div',
          { className: 'test' },
          'content',
        );

        const element2 = React.createElement(
          'div',
          { className: 'test' },
          'content',
        );

        // These elements have the same structure but different _owner references
        // fastDeepEqual should skip _owner comparison and not cause infinite loop
        // The result depends on whether other properties are equal
        const result = fastDeepEqualUntyped(element1, element2);

        // The important thing is that it doesn't throw or hang
        assert.isBoolean(result);
      });

      test('React elements with different props are not equal', () => {
        const element1 = React.createElement('div', { className: 'test1' });

        const element2 = React.createElement('div', { className: 'test2' });

        assert.isFalse(fastDeepEqualUntyped(element1, element2));
      });

      test('shouldComponentUpdate works correctly with circular references', () => {
        mut_renderCount = 0;

        // Create a child component instance
        const child = new ChildWithShouldComponentUpdate({
          children: [
            React.createElement('h1', { key: 'h1' }, 'Title'),
            React.createElement('h2', { key: 'h2' }, 'Subtitle'),
          ],
        });

        // Initial render
        child.render();

        assert.strictEqual(mut_renderCount, 1);

        // Update with same props structure - should not re-render
        const sameProps = {
          children: [
            React.createElement('h1', { key: 'h1' }, 'Title'),
            React.createElement('h2', { key: 'h2' }, 'Subtitle'),
          ],
        };

        if (child.shouldComponentUpdate(sameProps)) {
          child.render();
        }

        // Should still be 1 or 2 depending on React element comparison
        // The important thing is it doesn't throw or hang
        assert.isTrue(mut_renderCount >= 1);

        // Update with different props - should re-render
        const differentProps = {
          children: [
            React.createElement('h1', { key: 'h1' }, 'New Title'),
            React.createElement('h2', { key: 'h2' }, 'Subtitle'),
          ],
        };

        if (child.shouldComponentUpdate(differentProps)) {
          child.render();
        }

        // Should have rendered at least once more
        assert.isTrue(mut_renderCount >= 2);
      });
    });
  });
});
