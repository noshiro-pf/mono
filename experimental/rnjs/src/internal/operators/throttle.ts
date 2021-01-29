import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const throttle = <T>(time: number, name: string): Operator<T, T> => (
  src: RN<T>
) => new ThrottleRN<T>(src, time, name);

class ThrottleRN<T> extends RN<T> {
  private readonly time: number;
  private lastFireTime: number = 0;

  constructor(src: RN<T>, time: number, name: string = '') {
    super(src.value, [src], name);
    this.time = time;
  }

  protected fire(): void {
    if (Date.now() > this.lastFireTime + this.time) {
      this.fireWith((this.parents[0] as RN<any>).value);
      this.lastFireTime = Date.now();
    }
  }
}
