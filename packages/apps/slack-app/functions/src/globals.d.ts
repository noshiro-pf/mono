interface Buffer extends Uint8Array {
  indexOf(
    value: string | number | Uint8Array,
    byteOffset?: number,
    encoding?: BufferEncoding,
  ): SafeUint | -1;
  lastIndexOf(
    value: string | number | Uint8Array,
    byteOffset?: number,
    encoding?: BufferEncoding,
  ): SafeUint | -1;
  entries(): IterableIterator<readonly [SafeUint, Uint8]>;
  keys(): IterableIterator<SafeUint>;
  values(): IterableIterator<Uint8>;
}
