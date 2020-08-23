import { Rest } from './rest';
import { Zip } from './zip';
export declare type ShiftZip<T extends any[]> = Zip<T, Rest<T>>;
export declare type Tuple2Fn<T> = T extends [infer A, infer B] ? (x: A) => B : never;
export declare type _Pipe<T extends any[]> = {
    [P in keyof T]: Tuple2Fn<T[P]>;
};
export declare type Cast<T, P, D> = T extends P ? T : D;
//# sourceMappingURL=pipe.d.ts.map