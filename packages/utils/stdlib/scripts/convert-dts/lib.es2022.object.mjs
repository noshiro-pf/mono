/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Object = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    '/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />',
    [
      '/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />',
      '/// <reference path="./lib.es5.d.ts" />',
    ].join('\n')
  );

  ret = ret.replaceAll(
    'interface ObjectConstructor {',
    [
      '/**',
      ' * @internal',
      ' * O が union 型（要素数1の場合も含む）のとき、 union の要素の中に K をキーとして含むものが一つでもあれば、',
      ' * union 型を K をキーとして含むもののみに絞った型を返す。',
      ' * union の要素の中に K をキーとして含むものが一つも無ければ、`Record<K, unknown>` を返す。',
      ' * 結果には Readonly を付ける。',
      ' */',
      'type _HasOwnReturnType<',
      '  R extends RecordBase,',
      '  K extends PropertyKey',
      '> = R extends R // union distribution',
      '  ? K extends keyof R',
      '    ? string extends keyof R',
      '      ? Record<K, R[keyof R]> & R',
      '      : number extends keyof R',
      '      ? Record<K, R[keyof R]> & R',
      '      : symbol extends keyof R',
      '      ? Record<K, R[keyof R]> & R',
      '      : R',
      '    : never // omit union member that does not have key K',
      '  : never; // dummy case for union distribution',
      '',
      'interface ObjectConstructor {',
    ].join('\n')
  );

  ret = ret.replaceAll('@param o', '@param obj');
  ret = ret.replaceAll('@param v', '@param key');
  ret = ret.replaceAll(
    'hasOwn(o: object, v: PropertyKey): boolean;',
    [
      'hasOwn<R extends RecordBase, K extends PropertyKey>(',
      '  obj: R,',
      '  key: K',
      '): obj is _HasOwnReturnType<R, K>;',
    ].join('\n')
  );

  return ret;
};
