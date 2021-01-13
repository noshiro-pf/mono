import { ObservableType } from '../types';
import { Option } from '../util';
import { ManagerObservableClass } from './manager-observable';
import { ObservableClass } from './observable';
import { Observable } from './observable-interface';

export abstract class OperatorObservableClass<A, B>
  extends ObservableClass<B>
  implements Observable<B> {
  protected parent: Observable<A>; // alias for this.parents[0]

  constructor(
    type: ObservableType,
    parent: Observable<A>,
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

export abstract class ManagerOperatorObservableClass<A, B>
  extends ManagerObservableClass<B>
  implements Observable<B> {
  protected parent: Observable<A>; // alias for this.parents[0]

  constructor(
    type: ObservableType,
    parent: Observable<A>,
    currentValueInit: Option<B>,
    isUpdatedInit: boolean
  ) {
    super(type, parent.depth + 1, [parent], currentValueInit, isUpdatedInit);
    this.parent = parent;
  }
}
