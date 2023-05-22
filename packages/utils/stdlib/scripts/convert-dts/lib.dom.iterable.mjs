import { indexType } from './common.mjs';

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibDomIterable = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    'entries(): IterableIterator<readonly [number,',
    `entries(): IterableIterator<readonly [${indexType.ret},`
  );
  ret = ret.replaceAll(
    'keys(): IterableIterator<number>;',
    `keys(): IterableIterator<${indexType.ret}>;`
  );

  return ret;
};
