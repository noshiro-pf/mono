import { RN } from '../RN';
import { Unwrap } from '../utils';
export declare const combine: <T extends RN<any>[]>(...srcs: T) => RN<Unwrap<T>>;
export declare const every: (...srcs: RN<boolean>[]) => RN<boolean>;
export declare const some: (...srcs: RN<boolean>[]) => RN<boolean>;
//# sourceMappingURL=combine.d.ts.map