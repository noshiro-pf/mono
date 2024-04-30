import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { NumberType } from './common.mjs';

export const convertLibEs2020Sharedmemory = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        //
        'index: number',
        `index: ${NumberType.SafeUint}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        '(typedArray:',
        '<T extends TypedArrayElementTypes>(typedArray:',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        `value: bigint`,
        `value: T`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        `expectedValue: bigint`,
        `expectedValue: T`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `replacementValue: bigint`,
        `replacementValue: T`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        //
        `): bigint`,
        `): T`,
      ),
    )
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
