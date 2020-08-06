import { RN } from '../abstract_class';
export declare const timer: (millisec: number) => TimerRN;
export interface TimerRN extends RN<number> {
    start(): void;
    stop(): void;
}
//# sourceMappingURL=timer.d.ts.map