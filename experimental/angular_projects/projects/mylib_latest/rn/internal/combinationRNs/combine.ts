import { RN } from '../RN';
import { Unwrap, unwrapCurr } from '../utils';

export function combine<T extends RN<any>[]>(...srcs: T): RN<Unwrap<T>> {
  return new CombineRN(...srcs);
}

class CombineRN<T extends RN<any>[]> extends RN<Unwrap<T>> {
  constructor(...srcs: T) {
    if (srcs.length === 0) {
      throw new Error('srcs.length must be >= 1');
    }

    super(unwrapCurr(...srcs), srcs);
  }

  protected fire() {
    this.fireWith(unwrapCurr(...(this.parents as T)));
  }
}
