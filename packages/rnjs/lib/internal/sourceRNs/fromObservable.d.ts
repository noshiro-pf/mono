import { RN } from '../RN';
import { Subscribable } from '../types/Subscribable';
export declare const fromObservable: <T>(initialValue: T, obs: Subscribable<T>, name?: string) => FromObservableRN<T>;
declare class FromObservableRN<T> extends RN<T> {
    private obs;
    private latestValue;
    constructor(initialValue: T, obs: Subscribable<T>, name?: string);
}
export {};
//# sourceMappingURL=fromObservable.d.ts.map