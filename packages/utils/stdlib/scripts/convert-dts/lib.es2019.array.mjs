import { indexType } from './common.mjs';

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019Array = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    'readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly [\n          -1,\n          0,\n          1,\n          2,\n          3,\n          4,\n          5,\n          6,\n          7,\n          8,\n          9,\n          10,\n          11,\n          12,\n          13,\n          14,\n          15,\n          16,\n          17,\n          18,\n          19,\n          20\n        ][Depth])))))))))',
    'readonly [\n          -1,\n          0,\n          1,\n          2,\n          3,\n          4,\n          5,\n          6,\n          7,\n          8,\n          9,\n          10,\n          11,\n          12,\n          13,\n          14,\n          15,\n          16,\n          17,\n          18,\n          19,\n          20\n        ][Depth]',
  );

  // use branded number type in index
  ret = ret.replaceAll('index: number', `index: ${indexType.callbackArg}`);
  ret = ret.replaceAll(
    'flat<A, D extends number = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];',
    `flat<A, D extends ${indexType.argNonNegative} = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];`,
  );

  return ret;
};
