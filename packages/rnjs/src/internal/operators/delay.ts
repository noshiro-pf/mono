import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const delay = <T>(time: number, name: string = ''): Operator<T, T> => (
  src: RN<T>
) => new DelayRN<T>(src, time, name);

class DelayRN<T> extends RN<T> {
  private readonly time: number;
  private timerId: any;

  constructor(src: RN<T>, time: number, name: string) {
    super(src.value, [src], name);
    this.time = time;
  }

  protected fire(): void {
    this.timerId = setTimeout(() => {
      this.fireWith(this.parents[0].value);
    }, this.time);
  }

  protected complete(): void {
    super.complete();
    clearTimeout(this.timerId);
  }
}
