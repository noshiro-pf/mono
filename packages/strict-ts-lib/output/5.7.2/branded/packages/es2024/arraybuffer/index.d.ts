/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

interface ArrayBuffer {
  /**
   * If this ArrayBuffer is resizable, returns the maximum byte length given
   * during construction; returns the byte length if not.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/maxByteLength)
   */
  get maxByteLength(): NumberType.TypedArraySize;

  /**
   * Returns true if this ArrayBuffer can be resized.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resizable)
   */
  get resizable(): boolean;

  /**
   * Resizes the ArrayBuffer to the specified size (in bytes).
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resize)
   */
  resize(newByteLength?: NumberType.TypedArraySizeArgNonNegative): void;

  /**
   * Returns a boolean indicating whether or not this buffer has been detached
   * (transferred).
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/detached)
   */
  get detached(): boolean;

  /**
   * Creates a new ArrayBuffer with the same byte content as this buffer, then
   * detaches this buffer.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer)
   */
  transfer(
    newByteLength?: NumberType.TypedArraySizeArgNonNegative,
  ): ArrayBuffer;

  /**
   * Creates a new non-resizable ArrayBuffer with the same byte content as this
   * buffer, then detaches this buffer.
   *
   * [MDN](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transferToFixedLength)
   */
  transferToFixedLength(
    newByteLength?: NumberType.TypedArraySizeArgNonNegative,
  ): ArrayBuffer;
}

interface ArrayBufferConstructor {
  new (
    byteLength: NumberType.TypedArraySizeArgNonNegative,
    options?: {
      readonly maxByteLength?: NumberType.TypedArraySizeArgNonNegative;
    },
  ): ArrayBuffer;
}
