import { RN } from '../RN';
export declare const timer: (milliSec: number, startImmediately?: boolean, name?: string) => TimerRN;
declare class TimerRN extends RN<number> {
    private timerId;
    private milliSec;
    private started;
    constructor(milliSec: number, startImmediately?: boolean, name?: string);
    start(): void;
    stop(): void;
    protected complete(): void;
}
export {};
//# sourceMappingURL=timer.d.ts.map