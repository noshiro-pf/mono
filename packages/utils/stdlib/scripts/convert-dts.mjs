// @ts-check

import { getDistFileList, writeFileAsync } from './common.mjs';

const srcDir = './temp';
const distDir = './dist';

const distFileList = await getDistFileList(srcDir);

/**
 * @param {string} content
 * @param {string} filename
 * @returns {string}
 */
const convert = (content, filename) => {
  /** @type {string} */
  let ret = content;

  ret = ret.replaceAll(
    '/// <reference no-default-lib="true"/>',
    '/// <reference no-default-lib="true"/>\n/// <reference path="./utils.d.ts" />'
  );

  ret = ret.replaceAll(
    /\/\/\/ <reference lib="(.+)" \/>/gu,
    '/// <reference path="./lib.$1.d.ts" />'
  );

  ret = ret.replaceAll('declare var ', 'declare const ');
  ret = ret.replaceAll('declare let ', 'declare const ');
  ret = ret.replaceAll('  var ', '  const ');

  ret = ret.replaceAll(
    /\.\.\.([_\$a-zA-Z\\xA0-\\uFFFF][_\$a-zA-Z0-9\\xA0-\\uFFFF]*): readonly any\[\]/gu,
    '...$1: readonly never[]'
  );

  // change Set.has() and Map.has() to accept widen literal types
  if (filename === 'lib.es2015.collection.d.ts') {
    ret = ret.replaceAll(
      'has(key: K): boolean;',
      'has(key: K | (WidenLiteral<K> & {})): key is K;'
    );
    ret = ret.replaceAll(
      'has(value: T): boolean;',
      'has(value: T | (WidenLiteral<T> & {})): value is T;'
    );
  }

  // change Array.includes() to accept widen literal types
  if (filename === 'lib.es2016.array.include.d.ts') {
    ret = ret.replaceAll(
      'includes(searchElement: T, fromIndex?: number): boolean;',
      'includes(searchElement: T | (WidenLiteral<T> & {}), fromIndex?: number): searchElement is T;'
    );
  }

  ret = ret.replaceAll('radix?: number', 'radix?: UintRange<2, 36>');
  ret = ret.replaceAll(
    'fractionDigits?: number',
    'fractionDigits?: UintRange<0, 20>'
  );
  ret = ret.replaceAll('precision?: number', 'precision?: UintRange<1, 21>');

  // require predicate function to return boolean

  if (filename === 'lib.es5.d.ts') {
    ret = ret.replaceAll(
      'predicate: (value: T, index: number, array: T[]) => unknown',
      'predicate: (value: T, index: number, array: T[]) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: T, index: number, array: readonly T[]) => unknown',
      'predicate: (value: T, index: number, array: readonly T[]) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Int8Array) => unknown',
      'predicate: (value: number, index: number, array: Int8Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Int16Array) => unknown',
      'predicate: (value: number, index: number, array: Int16Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Int32Array) => unknown',
      'predicate: (value: number, index: number, array: Int32Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Uint8Array) => unknown',
      'predicate: (value: number, index: number, array: Uint8Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Uint16Array) => unknown',
      'predicate: (value: number, index: number, array: Uint16Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Uint32Array) => unknown',
      'predicate: (value: number, index: number, array: Uint32Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Float32Array) => unknown',
      'predicate: (value: number, index: number, array: Float32Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: number, index: number, array: Float64Array) => unknown',
      'predicate: (value: number, index: number, array: Float64Array) => boolean'
    );
  }

  // require predicate function to return boolean

  if (filename === 'lib.es2015.core.d.ts') {
    ret = ret.replaceAll(
      'predicate: (value: T, index: number, obj: T[]) => unknown',
      'predicate: (value: T, index: number, obj: T[]) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: T, index: number, obj: readonly T[]) => unknown',
      'predicate: (value: T, index: number, obj: readonly T[]) => boolean'
    );
  }

  if (filename === 'lib.es2015.iterable.d.ts') {
    ret = ret.replaceAll(
      'predicate: (value: T, index: number, obj: readonly T[]) => unknown',
      'predicate: (value: T, index: number, obj: readonly T[]) => boolean'
    );
  }

  if (filename === 'lib.es2020.bigint.d.ts') {
    ret = ret.replaceAll(
      'predicate: (value: bigint, index: number, array: BigInt64Array) => unknown',
      'predicate: (value: bigint, index: number, array: BigInt64Array) => boolean'
    );
    ret = ret.replaceAll(
      'predicate: (value: bigint, index: number, array: BigUint64Array) => unknown',
      'predicate: (value: bigint, index: number, array: BigUint64Array) => boolean'
    );
  }

  // require compareFn of Array.sort (lib.es5.d.ts)
  if (filename === 'lib.es5.d.ts') {
    ret = ret.replaceAll(
      'sort(compareFn?: (a: T, b: T) => number): this;',
      'sort(compareFn: (a: T, b: T) => number): this;'
    );
  }

  // remove readonly

  if (filename === 'lib.es2015.iterable.d.ts') {
    ret = ret.replaceAll(
      'from<T>(iterable: Iterable<T> | ArrayLike<T>): readonly T[];',
      'from<T>(iterable: Iterable<T> | ArrayLike<T>): T[];'
    );
  }

  ret = ret.replaceAll('readonly -readonly', '-readonly');
  ret = ret.replaceAll(
    'readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly [\n          -1,\n          0,\n          1,\n          2,\n          3,\n          4,\n          5,\n          6,\n          7,\n          8,\n          9,\n          10,\n          11,\n          12,\n          13,\n          14,\n          15,\n          16,\n          17,\n          18,\n          19,\n          20\n        ][Depth])))))))))',
    'readonly [\n          -1,\n          0,\n          1,\n          2,\n          3,\n          4,\n          5,\n          6,\n          7,\n          8,\n          9,\n          10,\n          11,\n          12,\n          13,\n          14,\n          15,\n          16,\n          17,\n          18,\n          19,\n          20\n        ][Depth]'
  );

  if (filename === 'lib.es5.d.ts') {
    ret = ret.replaceAll('  readonly [n: number]: T;', '  [n: number]: T;');
    ret = ret.replaceAll(
      '  readonly prototype: readonly unknown[];',
      '  readonly prototype: unknown[];'
    );
    ret = ret.replaceAll(
      'type Partial<T> = {\n  readonly [P in keyof T]?: T[P];\n};',
      'type Partial<T> = {\n  [P in keyof T]?: T[P];\n};'
    );

    ret = ret.replaceAll(
      'predicate: (\n      value: number,\n      index: number,\n      array: Uint8ClampedArray\n    ) => unknown,',
      'predicate: (\n      value: number,\n      index: number,\n      array: Uint8ClampedArray\n    ) => boolean,'
    );
  }

  // fix ...args type

  ret = ret.replaceAll('keyof unknown', 'keyof never');
  ret = ret.replaceAll('TReturn = unknown', 'TReturn = any');
  ret = ret.replaceAll('...args: unknown[]', '...args: readonly never[]');
  ret = ret.replaceAll(
    '...args: readonly unknown[]',
    '...args: readonly never[]'
  );
  ret = ret.replaceAll('...args: unknown', '...args: readonly never[]');

  if (filename === 'lib.es2015.core.d.ts') {
    ret = ret.replaceAll(
      'from<T>(arrayLike: ArrayLike<T>): readonly T[];',
      'from<T>(arrayLike: ArrayLike<T>): T[];'
    );
    ret = ret.replaceAll(
      'from<T, U>(\n    arrayLike: ArrayLike<T>,\n    mapfn: (v: T, k: number) => U,\n    thisArg?: unknown\n  ): readonly U[];',
      'from<T, U>(\n    arrayLike: ArrayLike<T>,\n    mapfn: (v: T, k: number) => U,\n    thisArg?: unknown\n  ): U[];'
    );
    ret = ret.replaceAll(
      'of<T>(...items: readonly T[]): readonly T[];',
      'of<T>(...items: readonly T[]): T[];'
    );
  }
  if (filename === 'lib.es2015.iterable.d.ts') {
    ret = ret.replaceAll(
      'from<T, U>(\n    iterable: Iterable<T> | ArrayLike<T>,\n    mapfn: (v: T, k: number) => U,\n    thisArg?: unknown\n  ): readonly U[];',
      'from<T, U>(\n    iterable: Iterable<T> | ArrayLike<T>,\n    mapfn: (v: T, k: number) => U,\n    thisArg?: unknown\n  ): U[];'
    );
    ret = ret.replaceAll(
      'interface MapConstructor {\n  new (): ReadonlyMap<unknown, unknown>;\n  new <K, V>(iterable?: Iterable<readonly [K, V]> | null): ReadonlyMap<K, V>;\n}',
      'interface MapConstructor {\n  new (): Map<unknown, unknown>;\n  new <K, V>(iterable?: Iterable<readonly [K, V]> | null): Map<K, V>;\n}'
    );
    ret = ret.replaceAll(
      'interface SetConstructor {\n  new <T>(iterable?: Iterable<T> | null): ReadonlySet<T>;\n}',
      'interface SetConstructor {\n  new <T>(iterable?: Iterable<T> | null): Set<T>;\n}'
    );
  }

  if (filename === 'lib.es2015.collection.d.ts') {
    ret = ret.replaceAll(
      'interface MapConstructor {\n  new (): ReadonlyMap<unknown, unknown>;\n  new <K, V>(entries?: readonly (readonly [K, V])[] | null): ReadonlyMap<K, V>;\n  readonly prototype: ReadonlyMap<unknown, unknown>;\n}',
      'interface MapConstructor {\n  new (): Map<unknown, unknown>;\n  new <K, V>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;\n  readonly prototype: Map<unknown, unknown>;\n}'
    );
    ret = ret.replaceAll(
      'interface SetConstructor {\n  new <T = unknown>(values?: readonly T[] | null): ReadonlySet<T>;\n  readonly prototype: ReadonlySet<unknown>;\n}',
      'interface SetConstructor {\n  new <T = unknown>(values?: readonly T[] | null): Set<T>;\n  readonly prototype: Set<unknown>;\n}'
    );
  }

  return ret;
};

await Promise.all(
  distFileList.map(({ content, filename }) =>
    writeFileAsync(`${distDir}/${filename}`, convert(content, filename))
  )
);
