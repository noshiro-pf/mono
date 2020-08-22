import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
import { Reverse } from './reverse';
export declare type Group<N extends number, T extends any[], R1 extends any[] = [], R2 extends any[] = []> = {
    0: Reverse<R2>;
    1: Group<N, T, [], Cons<Reverse<R1>, R2>>;
    2: Group<N, Rest<T>, Cons<First<T>, R1>, R2>;
}[T extends [] ? (R1 extends [] ? 0 : 1) : R1['length'] extends N ? 1 : 2];
//# sourceMappingURL=group.d.ts.map