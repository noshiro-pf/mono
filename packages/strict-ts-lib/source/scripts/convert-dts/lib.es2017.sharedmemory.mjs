import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017Sharedmemory = (from) =>
  pipe(from)
    .chain(replaceWithNoMatchCheck('index: number', 'index: SafeUint'))
    .chain(
      replaceWithNoMatchCheck('byteLength: number', 'byteLength: SafeUint'),
    )
    .chain(
      replaceWithNoMatchCheck(
        'slice(begin: number, end?: number)',
        'slice(begin: SafeUint, end?: SafeUint)',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        ['(', '    typedArray:'].join('\n'),
        ['<T extends TypedArrayElementTypes>(', '    typedArray:'].join('\n'),
      ),
    )
    .chain(replaceWithNoMatchCheck('value: number', 'value: T'))
    .chain(replaceWithNoMatchCheck('expectedValue: number', 'expectedValue: T'))
    .chain(
      replaceWithNoMatchCheck(
        'replacementValue: number',
        'replacementValue: T',
      ),
    )
    .chain(replaceWithNoMatchCheck('): number', '): T'))
    .chain(
      replaceWithNoMatchCheck(
        [
          'typedArray:',
          '      | Int8Array',
          '      | Uint8Array',
          '      | Int16Array',
          '      | Uint16Array',
          '      | Int32Array',
          '      | Uint32Array,',
        ].join('\n'),
        'typedArray: MapToTypedArray<T>,',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'interface Atomics {',
        [
          'type MapToTypedArray<T> = T extends Int8',
          '  ? Int8Array',
          '  : T extends Uint8',
          '  ? Uint8Array',
          '  : T extends Int16',
          '  ? Int16Array',
          '  : T extends Uint16',
          '  ? Uint16Array',
          '  : T extends Int32',
          '  ? Int32Array',
          '  : T extends Uint32',
          '  ? Uint32Array',
          '  : never;',
          '',
          'type TypedArrayElementTypes = Int8 | Uint8 | Int16 | Uint16 | Int32 | Uint32;',
          '',
          'interface Atomics {',
        ].join('\n'),
      ),
    ).value;
