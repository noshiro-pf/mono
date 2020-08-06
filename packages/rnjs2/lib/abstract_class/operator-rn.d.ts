import { RNType } from '../types';
import { Option } from '../util';
import { ManagerRNClass } from './manager-rn';
import { RNClass } from './rn';
import { RN } from './rn-interface';
export declare abstract class OperatorRNClass<A, B> extends RNClass<B> implements RN<B> {
    protected parent: RN<A>;
    constructor(type: RNType, parent: RN<A>, currentValueInit: Option<B>, isUpdatedInit: boolean);
}
export declare abstract class ManagerOperatorRNClass<A, B> extends ManagerRNClass<B> implements RN<B> {
    protected parent: RN<A>;
    constructor(type: RNType, parent: RN<A>, currentValueInit: Option<B>, isUpdatedInit: boolean);
}
//# sourceMappingURL=operator-rn.d.ts.map