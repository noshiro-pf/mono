import { RN } from '../abstract_class';
export declare const fromArray: <A>(values: A[]) => FromArrayRN<A>;
export interface FromArrayRN<A> extends RN<A> {
    emit(): void;
}
//# sourceMappingURL=from-array.d.ts.map