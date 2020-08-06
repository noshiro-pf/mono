import { RNType } from '../types';
import { Option } from '../util';
import { RNClass } from './rn';
import { RN } from './rn-interface';
export declare abstract class ManagerRNClass<A> extends RNClass<A> implements RN<A> {
    private procedure;
    constructor(type: RNType, depth: number, parents: RN<any>[], currentValueInit: Option<A>, isUpdatedInit: boolean);
    /** @internal */
    addDescendant(child: RN<any>): void;
    protected update(nextValue: A): void;
    /** @internal */
    tryUpdate(nextValue: A): void;
}
//# sourceMappingURL=manager-rn.d.ts.map