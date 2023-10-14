/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Sharedmemory = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    [
      '  waitAsync(',
      '    typedArray: Int32Array,',
      '    index: number,',
      '    value: number,',
    ].join('\n'),
    [
      '  waitAsync(',
      '    typedArray: Int32Array,',
      '    index: SafeUint,',
      '    value: Int32,',
    ].join('\n'),
  );
  ret = ret.replaceAll(
    [
      '  waitAsync(',
      '    typedArray: BigInt64Array,',
      '    index: number,',
      '    value: bigint,',
    ].join('\n'),
    [
      '  waitAsync(',
      '    typedArray: BigInt64Array,',
      '    index: SafeUint,',
      '    value: BigInt64,',
    ].join('\n'),
  );

  return ret;
};
