import { First } from './first';
import { Rest } from './rest';
export declare type Last<T extends any[]> = {
    0: never;
    1: First<T>;
    2: Last<Rest<T>>;
}[T extends [] ? 0 : T extends [any] ? 1 : 2];
//# sourceMappingURL=last.d.ts.map