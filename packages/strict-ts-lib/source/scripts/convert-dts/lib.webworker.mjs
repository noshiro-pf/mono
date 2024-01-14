import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibWebWorker = (from) =>
  pipe(from).chain(
    replaceWithNoMatchCheck(
      'json(): Promise<unknown>;',
      'json(): Promise<JSONType>;',
    ),
  ).value;
