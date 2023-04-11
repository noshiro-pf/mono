/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2022Sharedmemory = (from) => {
  let ret = from;

  ret = ret.replaceAll('index: number', 'index: SafeUint');
  ret = ret.replaceAll(
    '(\n    typedArray:',
    '<T extends TypedArrayElementTypes>(\n    typedArray:'
  );
  ret = ret.replaceAll(`value: bigint`, `value: T`);
  ret = ret.replaceAll(
    'typedArray: BigInt64Array | Int32Array,',
    'typedArray: MapToTypedArray<T>,'
  );
  ret = ret.replaceAll(
    'interface Atomics {',
    'type MapToTypedArray<T> = T extends BigInt64\n  ? BigInt64Array\n  : T extends Int32\n  ? Int32Array\n  : never;\n\ntype TypedArrayElementTypes = BigInt64 | Int32;\n\ninterface Atomics {'
  );

  return ret;
};
