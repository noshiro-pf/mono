import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2020Sharedmemory = (from) =>
  pipe(from)
    .chain(replaceWithNoMatchCheck('index: number', 'index: SafeUint'))
    .chain(
      replaceWithNoMatchCheck(
        '(\n    typedArray:',
        '<T extends TypedArrayElementTypes>(\n    typedArray:',
      ),
    )
    .chain(replaceWithNoMatchCheck(`value: bigint`, `value: T`))
    .chain(replaceWithNoMatchCheck(`expectedValue: bigint`, `expectedValue: T`))
    .chain(
      replaceWithNoMatchCheck(
        `replacementValue: bigint`,
        `replacementValue: T`,
      ),
    )
    .chain(replaceWithNoMatchCheck(`): bigint`, `): T`))
    .chain(
      replaceWithNoMatchCheck(
        'typedArray: BigInt64Array | BigUint64Array,',
        'typedArray: MapToTypedArray<T>,',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'interface Atomics {',
        [
          'type MapToTypedArray<T> = T extends BigInt64',
          '  ? BigInt64Array',
          '  : T extends BigUint64',
          '  ? BigUint64Array',
          '  : never;',
          '',
          'type TypedArrayElementTypes = BigInt64 | BigUint64;',
          '',
          'interface Atomics {',
        ].join('\n'),
      ),
    ).value;
