import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const skipAlreadyAppeared =
  <T, K extends keyof T>(key?: K, name: string = ''): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipAlreadyAppearedRN<T, K>(src, key, name);

class SkipAlreadyAppearedRN<T, K extends keyof T> extends RN<T> {
  private readonly key?: K;
  private appeared: Set<T | T[K]>;

  constructor(src: RN<T>, key?: K, name: string = '') {
    super(src.value, [src], name);
    this.appeared = new Set<T | T[K]>();
    this.appeared.add(src.value);
    this.key = key;
  }

  protected fire(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const nextVal = (this.parents[0] as RN<any>).value;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const v = this.key !== undefined ? nextVal[this.key] : nextVal;
    if (!this.appeared.has(v)) {
      this.appeared.add(v);
      this.fireWith(nextVal);
    }
  }

  protected complete(): void {
    super.complete();
    this.appeared.clear();
  }
}
