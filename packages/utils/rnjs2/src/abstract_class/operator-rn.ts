import { RNType } from '../types';
import { Option } from '../util';
import { ManagerRNClass } from './manager-rn';
import { RNClass } from './rn';
import { RN } from './rn-interface';

export abstract class OperatorRNClass<A, B>
  extends RNClass<B>
  implements RN<B> {
  protected parent: RN<A>; // alias for this.parents[0]

  constructor(
    type: RNType,
    parent: RN<A>,
    currentValueInit: Option<B>,
    isUpdatedInit: boolean
  ) {
    super(
      type,
      false,
      parent.depth + 1,
      [parent],
      currentValueInit,
      isUpdatedInit
    );
    this.parent = parent;
  }
}

export abstract class ManagerOperatorRNClass<A, B>
  extends ManagerRNClass<B>
  implements RN<B> {
  protected parent: RN<A>; // alias for this.parents[0]

  constructor(
    type: RNType,
    parent: RN<A>,
    currentValueInit: Option<B>,
    isUpdatedInit: boolean
  ) {
    super(type, parent.depth + 1, [parent], currentValueInit, isUpdatedInit);
    this.parent = parent;
  }
}
