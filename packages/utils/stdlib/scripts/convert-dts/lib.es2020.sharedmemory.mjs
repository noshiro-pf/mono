/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2020Sharedmemory = (from) => {
  let ret = from;

  ret = ret.replaceAll('index: number', 'index: SafeUint');
  ret = ret.replaceAll('byteLength: number', 'byteLength: SafeUint');
  ret = ret.replaceAll(
    'slice(begin: number, end?: number)',
    'slice(begin: SafeUint, end?: SafeUint)',
  );

  ret = ret.replaceAll(
    '(\n    typedArray:',
    '<T extends TypedArrayElementTypes>(\n    typedArray:',
  );
  ret = ret.replaceAll(`value: bigint`, `value: T`);
  ret = ret.replaceAll(`expectedValue: bigint`, `expectedValue: T`);
  ret = ret.replaceAll(`replacementValue: bigint`, `replacementValue: T`);
  ret = ret.replaceAll(`): bigint`, `): T`);
  ret = ret.replaceAll(
    'typedArray: BigInt64Array | BigUint64Array,',
    'typedArray: MapToTypedArray<T>,',
  );
  ret = ret.replaceAll(
    'interface Atomics {',
    'type MapToTypedArray<T> = T extends BigInt64\n  ? BigInt64Array\n  : T extends BigUint64\n  ? BigUint64Array\n  : never;\n\ntype TypedArrayElementTypes = BigInt64 | BigUint64;\n\ninterface Atomics {',
  );

  return ret;
};
