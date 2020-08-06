import { RN } from '../RN';
export declare const fromPromise: <T>(initialValue: T, pr: Promise<T>, name?: string) => FromPromiseRN<T>;
declare class FromPromiseRN<T> extends RN<T> {
    private pr;
    private returnValue;
    constructor(initialValue: T, pr: Promise<T>, name?: string);
}
export {};
//# sourceMappingURL=fromPromise.d.ts.map