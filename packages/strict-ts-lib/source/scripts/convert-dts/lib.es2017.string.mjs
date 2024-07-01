import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { indexType } from './common.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017String = (from) =>
  pipe(from).chain(
    replaceWithNoMatchCheck(
      'maxLength: number',
      `maxLength: ${indexType.argNonNegative}`,
    ),
  ).value;
