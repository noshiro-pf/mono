import { RN } from '../RN';

export const fromPromise = <T>(initialValue: T, pr: Promise<T>) =>
  new FromPromiseRN<T>(initialValue, pr);

class FromPromiseRN<T> extends RN<T> {
  private pr: Promise<T>;
  private returnValue: T;

  constructor(initialValue: T, pr: Promise<T>) {
    super(initialValue, []);
    this.pr = pr;
    this.returnValue = initialValue; // dummy

    this.pr.then((value) => {
      this.returnValue = value;
      this.fireWith(this.returnValue);
      this.complete();
    });
  }
}
