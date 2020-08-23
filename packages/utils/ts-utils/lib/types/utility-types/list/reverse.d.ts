import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
export declare type Reverse<L extends any[], X extends any[] = []> = {
    1: X;
    0: Reverse<Rest<L>, Cons<First<L>, X>>;
}[L extends [] ? 1 : 0];
//# sourceMappingURL=reverse.d.ts.map