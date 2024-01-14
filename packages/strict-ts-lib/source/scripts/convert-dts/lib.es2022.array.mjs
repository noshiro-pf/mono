import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { indexType } from './common.mjs';

const markers = {
  Array: {
    start: 'interface Array<T> {',
    end: 'interface ReadonlyArray<T> {',
  },
  ReadonlyArray: {
    start: 'interface ReadonlyArray<T> {',
    end: 'interface Int8Array {',
  },
};

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Array = (from) => {
  let mut_ret = from;

  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.Array.start),
      mut_ret.indexOf(markers.Array.end),
    );

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'at(index: number): T | undefined;',
            `at(index: ${indexType.arg}): T | undefined`,
          ),
        ).value,
      ),
    ).value;
  }

  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ReadonlyArray.start),
      mut_ret.indexOf(markers.ReadonlyArray.end),
    );

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            'at(index: number): T | undefined;',
            `at(index: ${indexType.arg}): T | undefined`,
          ),
        ).value,
      ),
    ).value;
  }

  for (const [typeName, returnTypeBefore, returnTypeAfter] of [
    ['Int8Array', 'number', 'Int8'],
    ['Uint8Array', 'number', 'Uint8'],
    ['Uint8ClampedArray', 'number', 'Uint8'],
    ['Int16Array', 'number', 'Int16'],
    ['Uint16Array', 'number', 'Uint16'],
    ['Int32Array', 'number', 'Int32'],
    ['Uint32Array', 'number', 'Uint32'],
    ['Float32Array', 'number', 'Float32'],
    ['Float64Array', 'number', 'Float64'],
    ['BigInt64Array', 'bigint', 'BigInt64'],
    ['BigUint64Array', 'bigint', 'BigUint64'],
  ]) {
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        [
          `interface ${typeName} {`,
          '  /**',
          '   * Returns the item located at the specified index.',
          '   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.',
          '   */',
          `  at(index: number): ${returnTypeBefore} | undefined;`,
          '}',
        ].join('\n'),
        [
          `interface ${typeName} {`,
          '  /**',
          '   * Returns the item located at the specified index.',
          '   * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.',
          '   */',
          `  at(index: ${indexType.arg}): ${returnTypeAfter} | undefined;`,
          '}',
        ].join('\n'),
      ),
    ).value;
  }

  return mut_ret;
};
