import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
import { Reverse } from './reverse';
export declare type Concat<A extends any[], B extends any[], R extends any[] = []> = {
    0: Reverse<R>;
    1: Concat<Rest<A>, B, Cons<First<A>, R>>;
    2: Concat<A, Rest<B>, Cons<First<B>, R>>;
}[A extends [] ? (B extends [] ? 0 : 2) : 1];
//# sourceMappingURL=concat.d.ts.map