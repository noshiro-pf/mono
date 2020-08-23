import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
export declare type Skip<N extends number, T extends any[], R extends any[] = []> = {
    0: T;
    1: Skip<N, Rest<T>, Cons<First<T>, R>>;
}[T extends [] ? 0 : R['length'] extends N ? 0 : 1];
//# sourceMappingURL=skip.d.ts.map