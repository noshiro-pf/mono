import { indexType } from './common.mjs';

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017String = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    'maxLength: number',
    `maxLength: ${indexType.argNonNegative}`,
  );

  return ret;
};
