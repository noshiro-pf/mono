import { RN } from '../RN';
export declare const manual: <T>(initialValue: T, name?: string) => ManualRN<T>;
export declare class ManualRN<T> extends RN<T> {
    constructor(initialValue: T, name?: string);
    emit(val: T): void;
}
//# sourceMappingURL=manual.d.ts.map