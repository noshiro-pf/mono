import { Observable } from './Observable';

export const interval = (milliSec: number) => new IntervalObservable(milliSec);

class IntervalObservable extends Observable<number> {
  private readonly milliSec: number;
  private counter: number;

  constructor(milliSec: number) {
    super();
    this.milliSec = milliSec;
    this.counter = 0;
    this.start();
  }

  private start() {
    setInterval(() => {
      this.counter += 1;
      this.update(this.counter);
    }, this.milliSec);
  }
}
