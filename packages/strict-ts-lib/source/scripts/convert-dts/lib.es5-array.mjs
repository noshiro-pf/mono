import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
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
 * @param {string} from
 * @param {boolean} commentOutDeprecated
 * @returns {string}
 */
export const convertLibEs5_Array = (from, commentOutDeprecated) => {
  let mut_ret = from;

  {
    /** @type {('ReadonlyArray' | 'Array')[]} */
    const keys = ['ReadonlyArray', 'Array'];

    for (const key of keys) {
      const slice = mut_ret.slice(
        mut_ret.indexOf(markers[key].start),
        mut_ret.indexOf(markers[key].end),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
          pipe(slice)
            .chain(
              // require predicate function to return boolean
              replaceWithNoMatchCheck(
                'predicate: (value: T, index: number, array: readonly T[]) => unknown',
                'predicate: (value: T, index: number, array: readonly T[]) => boolean',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'index: number',
                `index: ${indexType.callbackArg}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'searchElement: T, fromIndex?: number): number;',
                `searchElement: T, fromIndex?: ${indexType.arg}): ${indexType.searchResult};`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'currentIndex: number',
                `currentIndex: ${indexType.callbackArg}`,
              ),
            ).value,
        ),
      ).value;
    }
  }
  {
    /** @type {('ReadonlyArray' | 'ConcatArray' | 'Array')[]} */
    const keys = ['ReadonlyArray', 'ConcatArray', 'Array'];

    for (const key of keys) {
      const slice = mut_ret.slice(
        mut_ret.indexOf(markers[key].start),
        mut_ret.indexOf(markers[key].end),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
          pipe(slice).chain(
            replaceWithNoMatchCheck(
              'slice(start?: number, end?: number)',
              `slice(start?: ${indexType.arg}, end?: ${indexType.arg})`,
            ),
          ).value,
        ),
      ).value;
    }
  }
  {
    /** @type {('ReadonlyArray' | 'ConcatArray' | 'Array' | 'ArrayLike')[]} */
    const keys = ['ReadonlyArray', 'ConcatArray', 'Array', 'ArrayLike'];

    for (const key of keys) {
      const slice = mut_ret.slice(
        mut_ret.indexOf(markers[key].start),
        mut_ret.indexOf(markers[key].end),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
          pipe(slice).chain(
            replaceWithNoMatchCheck(
              `readonly length: ${indexType.size};`,
              'readonly length: number;',
            ),
          ).value,
        ),
      ).value;
    }
  }
  {
    // Array

    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.Array.start),
      mut_ret.indexOf(markers.Array.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            // require compareFn of Array.sort (lib.es5.d.ts)
            replaceWithNoMatchCheck('compareFn?', 'compareFn'),
          )
          .chain(
            // remove readonly from Array index signature
            replaceWithNoMatchCheck('readonly [n: number]', '[n: number]'),
          )
          .chain(
            replaceWithNoMatchCheck(`start: number`, `start: ${indexType.arg}`),
          )
          .chain(
            replaceWithNoMatchCheck(
              `deleteCount?: number`,
              `deleteCount?: ${indexType.argNonNegative}`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `deleteCount: number`,
              `deleteCount: ${indexType.argNonNegative}`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `unshift(...items: readonly T[]): number;`,
              `unshift(...items: readonly T[]): ${indexType.ret};`,
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              'push(...items: readonly T[]): number;',
              `push(...items: readonly T[]): ${indexType.ret};`,
            ),
          ).value,
      ),
    ).value;
  }
  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ArrayConstructor.start),
      mut_ret.indexOf(markers.ArrayConstructor.end),
    );
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice)
          .chain(
            replaceWithNoMatchCheck(
              `  new (arrayLength?: number): readonly unknown[];`,
              [
                '/** @deprecated use `Array.from({ length })` instead */\n',
                commentOutDeprecated ? '// ' : '',
                `new (arrayLength?: ${indexType.newArrayMaxSize}): readonly unknown[];`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  new <T>(arrayLength: number): readonly T[];`,
              [
                '/** @deprecated use `Array.from({ length })` instead */\n',
                commentOutDeprecated ? '// ' : '',
                `new <T>(arrayLength: ${indexType.newArrayMaxSize}): readonly T[];`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  new <T>(...items: readonly T[]): readonly T[];`,
              [
                '/** @deprecated use `[...items]` instead */\n',
                commentOutDeprecated ? '// ' : '',
                `new <T>(...items: readonly T[]): readonly T[];`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  (arrayLength?: number): readonly unknown[];`,
              [
                '/** @deprecated use `Array.from({ length })` instead */\n',
                commentOutDeprecated ? '// ' : '',
                `(arrayLength?: ${indexType.newArrayMaxSize}): readonly unknown[];`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  <T>(arrayLength: number): readonly T[];`,
              [
                '/** @deprecated use `Array.from({ length })` instead */\n',
                commentOutDeprecated ? '// ' : '',
                `<T>(arrayLength: ${indexType.newArrayMaxSize}): readonly T[];`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              `  <T>(...items: readonly T[]): readonly T[];`,
              [
                '/** @deprecated use `[...items]` instead */\n',
                commentOutDeprecated ? '// ' : '',
                `<T>(...items: readonly T[]): readonly T[];`,
              ].join(''),
            ),
          )
          .chain(
            replaceWithNoMatchCheck(
              '  readonly prototype: readonly unknown[];',
              '  readonly prototype: unknown[];',
            ),
          ).value,
      ),
    ).value;
  }

  return mut_ret;
};
