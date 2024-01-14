import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Sharedmemory = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        [
          '  waitAsync(',
          '    typedArray: Int32Array,',
          '    index: number,',
          '    value: number,',
        ].join('\n'),
        [
          '  waitAsync(',
          '    typedArray: Int32Array,',
          '    index: SafeUint,',
          '    value: Int32,',
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          '  waitAsync(',
          '    typedArray: BigInt64Array,',
          '    index: number,',
          '    value: bigint,',
        ].join('\n'),
        [
          '  waitAsync(',
          '    typedArray: BigInt64Array,',
          '    index: SafeUint,',
          '    value: BigInt64,',
        ].join('\n'),
      ),
    ).value;
