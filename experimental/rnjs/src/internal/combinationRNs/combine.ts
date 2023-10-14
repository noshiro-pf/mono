import { RN } from '../RN';
import { Unwrap, unwrapCurr } from '../utils';

export const combine = <T extends RN<any>[]>(...srcs: T): RN<Unwrap<T>> =>
  new CombineRN(...srcs);

export const every = (...srcs: RN<boolean>[]): RN<boolean> =>
  new CombineRN(...srcs).map((xs) => xs.every((x) => x));

export const some = (...srcs: RN<boolean>[]): RN<boolean> =>
  new CombineRN(...srcs).map((xs) => xs.some((x) => x));

class CombineRN<T extends RN<any>[]> extends RN<Unwrap<T>> {
  constructor(...srcs: T) {
    if (srcs.length === 0) {
      throw new Error('srcs.length must be >= 1');
    }

    super(
      unwrapCurr(...srcs),
      srcs,
      `combine(${srcs.map((e) => e.name).join(',')})`,
    );
  }

  protected fire(): void {
    this.fireWith(unwrapCurr(...(this.parents as T)));
  }
}
