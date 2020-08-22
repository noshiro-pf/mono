import { ObservedValueOf } from 'rxjs';
export declare type Unwrap<S> = {
    [P in keyof S]: ObservedValueOf<S[P]>;
};
//# sourceMappingURL=unwrap.d.ts.map