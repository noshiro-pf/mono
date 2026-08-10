import { Num, range } from '@noshiro/ts-utils';

export type ReadonlyBitArrayType = Readonly<{
  size: NumberType.TypedArraySize;
  get: (at: SafeIntWithSmallInt) => 0 | 1 | undefined;

  values: () => IterableIterator<0 | 1>;
  entries: () => IterableIterator<readonly [NumberType.TypedArraySize, 0 | 1]>;
  map: (
    fn: (value: 0 | 1, index: NumberType.TypedArraySize) => 0 | 1,
  ) => ReadonlyBitArrayType;
  forEach: (
    fn: (value: 0 | 1, index: NumberType.TypedArraySize) => void,
  ) => void;
  toString: () => string;
}>;

class CReadonlyBitArray implements ReadonlyBitArrayType {
  readonly #data: Uint8Array;
  readonly #isInRange;

  constructor(input: Readonly<Uint8Array> | readonly (0 | 1)[]) {
    this.#data = new Uint8Array(input);
    this.#isInRange = Num.isInRange(0, input.length);
  }

  get size(): NumberType.TypedArraySize {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return this.#data.length as NumberType.TypedArraySize;
  }

  get(at: SafeIntWithSmallInt): 0 | 1 | undefined {
    if (!this.#isInRange(at)) {
      return undefined;
    }

    return this.#data[at] === 0 ? 0 : 1;
  }

  *values(): IterableIterator<0 | 1> {
    for (const idx of range(0, this.size)) {
      yield this.#data[idx] === 0 ? 0 : 1;
    }
  }

  *entries(): IterableIterator<readonly [NumberType.TypedArraySize, 0 | 1]> {
    for (const idx of range(0, this.size)) {
      yield [idx, this.#data[idx] === 0 ? 0 : 1];
    }
  }

  map(
    fn: (value: 0 | 1, index: NumberType.TypedArraySize) => 0 | 1,
  ): ReadonlyBitArrayType {
    return ReadonlyBitArray(this.#data.map((v, i) => fn(v === 0 ? 0 : 1, i)));
  }

  forEach(fn: (value: 0 | 1, index: NumberType.TypedArraySize) => void): void {
    for (const [i, v] of this.#data.entries()) {
      fn(v === 0 ? 0 : 1, i);
    }
  }

  toString(): string {
    return this.#data.map((v) => (v === 0 ? 0 : 1)).join('');
  }
}

export const ReadonlyBitArray = (
  input: Readonly<Uint8Array> | readonly (0 | 1)[],
): ReadonlyBitArrayType => new CReadonlyBitArray(input);

export const ReadonlyBitArrayFromStr = (bitStr: string): ReadonlyBitArrayType =>
  ReadonlyBitArray(Array.from(bitStr, (c) => (c === '0' ? 0 : 1)));

export const ReadonlyBitArrayOfLength = (
  len: NumberType.TypedArraySize,
): ReadonlyBitArrayType => ReadonlyBitArray(new Uint8Array(len).fill(0));
