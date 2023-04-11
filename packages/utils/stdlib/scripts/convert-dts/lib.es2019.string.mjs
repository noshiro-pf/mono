/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019String = (from) => {
  let ret = from;

  // comment out deprecated functions
  for (const line of ['trimLeft(): string;', 'trimRight(): string;']) {
    ret = ret.replaceAll(line, `// ${line}`);
  }

  return ret;
};
