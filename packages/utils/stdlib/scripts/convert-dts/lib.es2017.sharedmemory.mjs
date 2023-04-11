/**
 *
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2017Sharedmemory = (from) => {
  let ret = from;

  ret = ret.replaceAll('index: number', 'index: SafeUint');
  ret = ret.replaceAll('byteLength: number', 'byteLength: SafeUint');
  ret = ret.replaceAll(
    'slice(begin: number, end?: number)',
    'slice(begin: SafeUint, end?: SafeUint)'
  );

  ret = ret.replaceAll(
    '(\n    typedArray:',
    '<T extends TypedArrayElementTypes>(\n    typedArray:'
  );
  ret = ret.replaceAll(`value: number`, `value: T`);
  ret = ret.replaceAll(`expectedValue: number`, `expectedValue: T`);
  ret = ret.replaceAll(`replacementValue: number`, `replacementValue: T`);
  ret = ret.replaceAll(`): number`, `): T`);
  ret = ret.replaceAll(
    'typedArray:\n      | Int8Array\n      | Uint8Array\n      | Int16Array\n      | Uint16Array\n      | Int32Array\n      | Uint32Array,',
    'typedArray: MapToTypedArray<T>,'
  );
  ret = ret.replaceAll(
    'interface Atomics {',
    'type MapToTypedArray<T> = T extends Int8\n  ? Int8Array\n  : T extends Uint8\n  ? Uint8Array\n  : T extends Int16\n  ? Int16Array\n  : T extends Uint16\n  ? Uint16Array\n  : T extends Int32\n  ? Int32Array\n  : T extends Uint32\n  ? Uint32Array\n  : never;\n\ntype TypedArrayElementTypes = Int8 | Uint8 | Int16 | Uint16 | Int32 | Uint32;\n\ninterface Atomics {'
  );

  return ret;
};
