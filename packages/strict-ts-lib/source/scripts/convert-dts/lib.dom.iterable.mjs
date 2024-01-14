import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
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
