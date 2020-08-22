import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
import { Reverse } from './reverse';
export declare type Take<N extends number, T extends any[], R extends any[] = []> = {
    0: Reverse<R>;
    1: Take<N, Rest<T>, Cons<First<T>, R>>;
}[T extends [] ? 0 : R['length'] extends N ? 0 : 1];
//# sourceMappingURL=take.d.ts.map