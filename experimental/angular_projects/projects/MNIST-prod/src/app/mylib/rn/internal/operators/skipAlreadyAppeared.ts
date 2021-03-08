import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const skipAlreadyAppeared = <T, K extends keyof T>(
  key?: K
): Operator<T, T> => (src: RN<T>) => new SkipAlreadyAppearedRN<T, K>(src, key);

class SkipAlreadyAppearedRN<T, K extends keyof T> extends RN<T> {
  private key?: K;
  private appeared: Set<T | T[K]>;

  constructor(src: RN<T>, key?: K) {
    super(src.value, [src]);
    this.appeared = new Set<T | T[K]>();
    this.key = key;
  }

  protected fire() {
    const nextVal = this.parents[0].value;
    const v = this.key ? nextVal[this.key] : nextVal;
    if (!this.appeared.has(v)) {
      this.appeared.add(v);
      this.fireWith(nextVal);
    }
  }

  complete() {
    super.complete();
    this.appeared.clear();
  }
}
