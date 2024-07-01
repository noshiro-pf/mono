import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { indexType } from './common.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertTypedArrayCommon = (from) =>
  pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        'copyWithin(target: number, start: number, end?: number): this;',
        `copyWithin(target: ${indexType.arg}, start: ${indexType.arg}, end?: ${indexType.arg}): this;`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'subarray(begin?: number, end?: number)',
        `subarray(begin?: ${indexType.arg}, end?: ${indexType.arg})`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'slice(start?: number, end?: number)',
        `slice(start?: ${indexType.arg}, end?: ${indexType.arg})`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'offset?: number',
        `offset?: ${indexType.argNonNegative}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `fromIndex?: number`,
        `fromIndex?: ${indexType.arg}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'currentIndex: number',
        `currentIndex: ${indexType.callbackArg}`,
      ),
    ).value;
