/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibDom = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    'json(): Promise<unknown>;',
    'json(): Promise<JSONType>;',
  );

  return ret;
};
