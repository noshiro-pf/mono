import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
import { Reverse } from './reverse';
export declare type Zip<A extends any[], B extends any[], R extends any[] = []> = {
    0: Reverse<R>;
    1: Zip<Rest<A>, Rest<B>, Cons<[First<A>, First<B>], R>>;
}[A extends [] ? 0 : B extends [] ? 0 : 1];
//# sourceMappingURL=zip.d.ts.map