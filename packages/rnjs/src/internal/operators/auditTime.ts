import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const auditTime = <T>(
  time: number,
  name: string = ''
): Operator<T, T> => (src: RN<T>) => new AuditTimeRN<T>(src, time, name);

class AuditTimeRN<T> extends RN<T> {
  private readonly time: number;
  private timerId: any;
  private timerIsRunning: boolean = false;

  constructor(src: RN<T>, time: number, name: string) {
    super(src.value, [src], name);
    this.time = time;
  }

  protected fire(): void {
    if (!this.timerIsRunning) {
      this.timerIsRunning = true;
      this.timerId = setTimeout(() => {
        this.fireWith(this.parents[0].value);
        this.timerIsRunning = false;
      }, this.time);
    }
  }

  protected complete(): void {
    super.complete();
    clearTimeout(this.timerId);
  }
}
