export declare const mapNullable: <A, B>(fn: (v: A) => B) => (value: A | undefined) => B | undefined;
export declare const toNumber: (value: string) => number | undefined;
export declare const halfInt: (x: number) => number;
export declare const binarySearch: (sortedArray: number[], x: number) => number;
export declare const noop: () => void;
export declare type None = {
    readonly _type: 'None';
};
export declare const none: None;
export declare type Some<A> = {
    readonly _type: 'Some';
    value: A;
};
export declare const some: <A>(a: A) => Option<A>;
export declare type Option<A> = None | Some<A>;
export declare const isNone: <A>(value: Option<A>) => value is None;
export declare const isNotNone: <A>(value: Option<A>) => value is Some<A>;
//# sourceMappingURL=utils.d.ts.map