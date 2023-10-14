import { indexType } from './common.mjs';

const markers = {
  ReadonlyArray: {
    start: 'interface ReadonlyArray<T> {',
    end: 'interface ConcatArray<T> {',
  },
  ConcatArray: {
    start: 'interface ConcatArray<T> {',
    end: 'interface Array<T> {',
  },
  Array: {
    start: 'interface Array<T> {',
    end: 'interface ArrayConstructor {',
  },
  ArrayConstructor: {
    start: 'interface ArrayConstructor {',
    end: 'declare const Array: ArrayConstructor;',
  },
  ArrayLike: {
    start: 'interface ArrayLike<T> {',
    end: 'type Partial<T> = {',
  },
};

/**
 *
 * @param {string} from
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convertLibEs5_Array = (from, commentOutDeprecated) => {
  let ret = from;

  {
    /** @type {('ReadonlyArray' | 'ConcatArray' | 'Array' | 'ArrayLike')[]} */
    const keys = ['ReadonlyArray', 'ConcatArray', 'Array', 'ArrayLike'];

    for (const key of keys) {
      const slice = ret.slice(
        ret.indexOf(markers[key].start),
        ret.indexOf(markers[key].end),
      );
      ret = ret.replaceAll(
        slice,
        slice
          .replaceAll(
            `readonly length: ${indexType.size};`,
            `readonly length: number;`,
          )
          // require predicate function to return boolean
          .replaceAll(
            'predicate: (value: T, index: number, array: T[]) => unknown',
            'predicate: (value: T, index: number, array: T[]) => boolean',
          )
          .replaceAll(
            'predicate: (value: T, index: number, array: readonly T[]) => unknown',
            'predicate: (value: T, index: number, array: readonly T[]) => boolean',
          )
          .replaceAll(`index: number`, `index: ${indexType.callbackArg}`)
          .replaceAll(`start: number`, `start: ${indexType.arg}`)
          .replaceAll(
            `deleteCount?: number`,
            `deleteCount?: ${indexType.argNonNegative}`,
          )
          .replaceAll(
            `deleteCount: number`,
            `deleteCount: ${indexType.argNonNegative}`,
          )
          .replaceAll(
            `unshift(...items: readonly T[]): number;`,
            `unshift(...items: readonly T[]): ${indexType.ret};`,
          )
          .replaceAll(
            'push(...items: readonly T[]): number;',
            `push(...items: readonly T[]): ${indexType.ret};`,
          )
          .replaceAll(
            `searchElement: T, fromIndex?: number): number;`,
            `searchElement: T, fromIndex?: ${indexType.arg}): ${indexType.searchResult};`,
          )
          .replaceAll(
            `currentIndex: number`,
            `currentIndex: ${indexType.callbackArg}`,
          )
          .replaceAll(
            `slice(start?: number, end?: number)`,
            `slice(start?: ${indexType.arg}, end?: ${indexType.arg})`,
          ),
      );
    }
  }
  {
    // Array

    const slice = ret.slice(
      ret.indexOf(markers.Array.start),
      ret.indexOf(markers.Array.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        // require compareFn of Array.sort (lib.es5.d.ts)
        .replaceAll('compareFn?', 'compareFn')
        // remove readonly from Array index signature
        .replaceAll('readonly [n: number]', '[n: number]'),
    );
  }
  {
    const slice = ret.slice(
      ret.indexOf(markers.ArrayConstructor.start),
      ret.indexOf(markers.ArrayConstructor.end),
    );
    ret = ret.replaceAll(
      slice,
      slice
        .replaceAll(
          `  new (arrayLength?: number): readonly unknown[];`,
          [
            '/** @deprecated use `Array.from({ length })` instead */\n',
            commentOutDeprecated ? '// ' : '',
            `new (arrayLength?: ${indexType.newArrayMaxSize}): readonly unknown[];`,
          ].join(''),
        )
        .replaceAll(
          `  new <T>(arrayLength: number): readonly T[];`,
          [
            '/** @deprecated use `Array.from({ length })` instead */\n',
            commentOutDeprecated ? '// ' : '',
            `new <T>(arrayLength: ${indexType.newArrayMaxSize}): readonly T[];`,
          ].join(''),
        )
        .replaceAll(
          `  new <T>(...items: readonly T[]): readonly T[];`,
          [
            '/** @deprecated use `[...items]` instead */\n',
            commentOutDeprecated ? '// ' : '',
            `new <T>(...items: readonly T[]): readonly T[];`,
          ].join(''),
        )
        .replaceAll(
          `  (arrayLength?: number): readonly unknown[];`,
          [
            '/** @deprecated use `Array.from({ length })` instead */\n',
            commentOutDeprecated ? '// ' : '',
            `(arrayLength?: ${indexType.newArrayMaxSize}): readonly unknown[];`,
          ].join(''),
        )
        .replaceAll(
          `  <T>(arrayLength: number): readonly T[];`,
          [
            '/** @deprecated use `Array.from({ length })` instead */\n',
            commentOutDeprecated ? '// ' : '',
            `<T>(arrayLength: ${indexType.newArrayMaxSize}): readonly T[];`,
          ].join(''),
        )
        .replaceAll(
          `  <T>(...items: readonly T[]): readonly T[];`,
          [
            '/** @deprecated use `[...items]` instead */\n',
            commentOutDeprecated ? '// ' : '',
            `<T>(...items: readonly T[]): readonly T[];`,
          ].join(''),
        )
        .replaceAll(
          '  readonly prototype: readonly unknown[];',
          '  readonly prototype: unknown[];',
        ),
    );
  }

  return ret;
};
