import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertTemplate = (from) => {
  let mut_ret = from;

  mut_ret = pipe(mut_ret).chain(replaceWithNoMatchCheck('@@@', '@@@')).value;

  return mut_ret;
};
