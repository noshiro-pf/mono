import { indexType } from './common.mjs';

/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019Array = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    [
      '        readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly (readonly [',
      '          -1,',
      '          0,',
      '          1,',
      '          2,',
      '          3,',
      '          4,',
      '          5,',
      '          6,',
      '          7,',
      '          8,',
      '          9,',
      '          10,',
      '          11,',
      '          12,',
      '          13,',
      '          14,',
      '          15,',
      '          16,',
      '          17,',
      '          18,',
      '          19,',
      '          20,',
      '        ][Depth])))))))))',
    ].join('\n'),
    [
      'readonly [',
      '-1,',
      '0,',
      '1,',
      '2,',
      '3,',
      '4,',
      '5,',
      '6,',
      '7,',
      '8,',
      '9,',
      '10,',
      '11,',
      '12,',
      '13,',
      '14,',
      '15,',
      '16,',
      '17,',
      '18,',
      '19,',
      '20,',
      '][Depth]',
    ].join('\n'),
  );

  // use branded number type in index
  ret = ret.replaceAll('index: number', `index: ${indexType.callbackArg}`);
  ret = ret.replaceAll(
    'flat<A, D extends number = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];',
    `flat<A, D extends ${indexType.argNonNegative} = 1>(this: A, depth?: D): readonly FlatArray<A, D>[];`,
  );

  return ret;
};
