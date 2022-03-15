import { isInRange } from '../num';

export type ReadonlyBitArrayType = Readonly<{
  size: number;
  get: (at: number) => 0 | 1 | undefined;

  values: () => IterableIterator<0 | 1>;
  entries: () => IterableIterator<[number, 0 | 1]>;
  map: (fn: (value: 0 | 1, index: number) => 0 | 1) => ReadonlyBitArrayType;
  forEach: (fn: (value: 0 | 1, index: number) => void) => void;
  toString: () => string;
}>;

class CReadonlyBitArray implements ReadonlyBitArrayType {
  private readonly _data: Uint8Array;
  private readonly _isInRange;

  constructor(input: Readonly<Uint8Array> | readonly (0 | 1)[]) {
    this._data = new Uint8Array(input);
    this._isInRange = isInRange(0, input.length - 1);
  }

  get size(): number {
    return this._data.length;
  }

  get(at: number): 0 | 1 | undefined {
    if (!this._isInRange(at)) {
      return undefined;
    }
    return this._data[at] === 0 ? 0 : 1;
  }

  *values(): IterableIterator<0 | 1> {
    let idx = 0;
    while (idx < this.size) {
      yield this._data[idx] === 0 ? 0 : 1;
      idx += 1;
    }
  }

  *entries(): IterableIterator<[number, 0 | 1]> {
    let idx = 0;
    while (idx < this.size) {
      yield [idx, this._data[idx] === 0 ? 0 : 1];
      idx += 1;
    }
  }

  map(fn: (value: 0 | 1, index: number) => 0 | 1): ReadonlyBitArrayType {
    return ReadonlyBitArray(this._data.map((v, i) => fn(v === 0 ? 0 : 1, i)));
  }

  forEach(fn: (value: 0 | 1, index: number) => void): void {
    this._data.forEach((v, i) => {
      fn(v === 0 ? 0 : 1, i);
    });
  }

  toString(): string {
    return this._data.map((v) => (v === 0 ? 0 : 1)).join('');
  }
}

export const ReadonlyBitArray = (
  input: Readonly<Uint8Array> | readonly (0 | 1)[]
): ReadonlyBitArrayType => new CReadonlyBitArray(input) as ReadonlyBitArrayType;

export const ReadonlyBitArrayFromStr = (bitStr: string): ReadonlyBitArrayType =>
  ReadonlyBitArray(Array.from(bitStr, (c) => (c === '0' ? 0 : 1)));

export const ReadonlyBitArrayOfLength = (len: number): ReadonlyBitArrayType =>
  ReadonlyBitArray(new Uint8Array(len).fill(0));
