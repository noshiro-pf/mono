import { indexType } from './common.mjs';

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertTypedArrayCommon = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    'copyWithin(target: number, start: number, end?: number): this;',
    `copyWithin(target: ${indexType.arg}, start: ${indexType.arg}, end?: ${indexType.arg}): this;`
  );

  ret = ret.replaceAll(
    'subarray(begin?: number, end?: number)',
    `subarray(begin?: ${indexType.arg}, end?: ${indexType.arg})`
  );
  ret = ret.replaceAll(
    'slice(start?: number, end?: number)',
    `slice(start?: ${indexType.arg}, end?: ${indexType.arg})`
  );
  ret = ret.replaceAll(
    'readonly byteLength: number',
    `readonly byteLength: ${indexType.ret}`
  );
  ret = ret.replaceAll(
    'readonly byteOffset: number',
    `readonly byteOffset: ${indexType.ret}`
  );
  ret = ret.replaceAll(
    'byteOffset?: number',
    `byteOffset?: ${indexType.argNonNegative}`
  );

  ret = ret.replaceAll(
    'offset?: number',
    `offset?: ${indexType.argNonNegative}`
  );
  ret = ret.replaceAll(`fromIndex?: number`, `fromIndex?: ${indexType.arg}`);

  ret = ret.replaceAll(
    'currentIndex: number',
    `currentIndex: ${indexType.callbackArg}`
  );

  return ret;
};
