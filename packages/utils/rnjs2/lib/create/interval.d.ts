import { RN } from '../abstract_class';
export declare const interval: (millisec: number) => IntervalRN;
export interface IntervalRN extends RN<number> {
    start(): void;
    stop(): void;
}
//# sourceMappingURL=interval.d.ts.map