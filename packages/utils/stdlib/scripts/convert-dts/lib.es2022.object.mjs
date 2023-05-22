/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Object = (from) => {
  let ret = from;

  ret = ret.replaceAll(
    '/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />',
    '/// <reference path="../../ts-type-utils-no-stdlib/ts-type-utils-no-stdlib.d.ts" />\n/// <reference path="./lib.es5.d.ts" />'
  );
  ret = ret.replaceAll(
    'hasOwn(o: object, v: PropertyKey): boolean;',
    'hasOwn<R extends RecordBase, K extends (keyof R | (string & {})) | Exclude<PropertyKey, string>>(obj: R, key: K): obj is R & Record<K, R[K]>;'
  );

  return ret;
};
