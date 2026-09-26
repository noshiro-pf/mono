// Without an implementation the compiler accepts the split, so for ambient
// overloads the rule is the only thing that reports it.
// @sumi-expect-error functions/adjacent-overload-signatures
export declare function measure(value: string): number;
export const unit = 'px';
export declare function measure(value: readonly string[]): readonly number[];
