import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const debounce =
  <T>(time: number, name: string = ''): Operator<T, T> =>
  (src: RN<T>) =>
    new DebounceRN<T>(src, time, name);

class DebounceRN<T> extends RN<T> {
  private readonly time: number;
  private timerId: any;

  constructor(src: RN<T>, time: number, name: string) {
    super(src.value, [src], name);
    this.time = time;
  }

  protected fire(): void {
    clearTimeout(this.timerId);

    this.timerId = setTimeout(() => {
      this.fireWith((this.parents[0] as RN<any>).value);
    }, this.time);
  }

  protected complete(): void {
    super.complete();
    clearTimeout(this.timerId);
  }
}
