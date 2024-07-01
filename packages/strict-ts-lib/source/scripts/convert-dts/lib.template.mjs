import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertTemplate = (from) => {
  let mut_ret = from;

  mut_ret = pipe(mut_ret).chain(replaceWithNoMatchCheck('@@@', '@@@')).value;

  return mut_ret;
};
