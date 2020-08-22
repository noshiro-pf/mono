import { RN } from '../abstract_class';
export declare const source: <A>() => SourceRN<A>;
export declare const subject: <A>() => SourceRN<A>;
export interface SourceRN<A> extends RN<A> {
    push(nextValue: A): void;
}
//# sourceMappingURL=source.d.ts.map