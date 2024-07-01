import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { indexType } from './common.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibDomIterable = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        'entries(): IterableIterator<readonly [number,',
        `entries(): IterableIterator<readonly [${indexType.ret},`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'keys(): IterableIterator<number>;',
        `keys(): IterableIterator<${indexType.ret}>;`,
      ),
    ).value;
