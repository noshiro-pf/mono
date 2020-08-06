import { RN } from '../RN';
export declare const interval: (milliSec: number, startImmediately?: boolean, name?: string) => IntervalRN;
declare class IntervalRN extends RN<number> {
    private timerId;
    private counter;
    private milliSec;
    private started;
    constructor(milliSec: number, startImmediately?: boolean, name?: string);
    start(): void;
    stop(): void;
    protected complete(): void;
}
export {};
//# sourceMappingURL=interval.d.ts.map