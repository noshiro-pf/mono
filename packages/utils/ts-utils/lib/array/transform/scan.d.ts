import { ReducerType } from '../../types';
import { ReadonlyNonEmptyArray } from '../non-empty-array';
export declare const scan: <A, B>(reducer: ReducerType<B, A>, init: B) => (array: readonly A[] | ReadonlyNonEmptyArray<A>) => ReadonlyNonEmptyArray<B>;
//# sourceMappingURL=scan.d.ts.map