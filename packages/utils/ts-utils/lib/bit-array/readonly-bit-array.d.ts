export interface ReadonlyBitArrayType {
    size: number;
    get(at: number): 0 | 1 | undefined;
    get(at: number, notSetValue: 0 | 1): 0 | 1;
    values: () => IterableIterator<0 | 1>;
    entries: () => IterableIterator<[number, 0 | 1]>;
    map(fn: (value: 0 | 1, index: number) => 0 | 1): ReadonlyBitArrayType;
    forEach(fn: (value: 0 | 1, index: number) => void): void;
    toString: () => string;
}
export declare const ReadonlyBitArray: (input?: Uint8Array | (0 | 1)[] | undefined) => ReadonlyBitArrayType;
export declare const ReadonlyBitArrayFromStr: (bitstr: string) => ReadonlyBitArrayType;
export declare const ReadonlyBitArrayOfLength: (len: number) => ReadonlyBitArrayType;
//# sourceMappingURL=readonly-bit-array.d.ts.map