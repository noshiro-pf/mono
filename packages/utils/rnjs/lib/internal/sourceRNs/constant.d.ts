import { RN } from '../RN';
export declare const constant: <T>(value: T, name?: string) => ConstantRN<T>;
export declare const of: <T>(value: T, name?: string) => ConstantRN<T>;
declare class ConstantRN<T> extends RN<T> {
    constructor(value: T, name?: string);
}
export {};
//# sourceMappingURL=constant.d.ts.map