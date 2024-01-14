import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
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
